import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { AntDesign } from '@expo/vector-icons';
import axios from 'axios';

//API Keys have been redacted for security/privacy reasons
const GOOGLE_API_KEY = ''; 
const SEARCH_ENGINE_ID = '';
const OPENAI_API_KEY = '' ;

export default function Camera() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photos, setPhotos] = useState<any[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResults, setOcrResults] = useState<any[]>([]); 
  const cameraRef = useRef<CameraView | null>(null);

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, base64: true });
      setPhotos([...photos, photo]);
      setIsCameraActive(false);
    }
  };

  const handleRetakePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleAddAnotherPhoto = () => {
    setIsCameraActive(true);
  };

  const handleProcessMenu = async () => {
    setIsProcessing(true);
    const results: any[] = [];

    for (const photo of photos) {
      try {
        const rawText = await processImageWithGoogleVision(photo.base64);
        const structuredData = parseMenuText(rawText);
        const structuredDataWithImages = await addImagesToDishes(structuredData); 
        results.push(...structuredDataWithImages);
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }

    setOcrResults(results);
    setIsProcessing(false);
  };

  const processImageWithGoogleVision = async (base64Image: string) => {
    const visionEndpoint = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`;
    const requestPayload = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }],
        },
      ],
    };

    try {
      const response = await axios.post(visionEndpoint, requestPayload);
      const textAnnotations = response.data.responses[0].textAnnotations;
      return textAnnotations ? textAnnotations[0].description : '';
    } catch (error) {
      console.error('Error with Vision API:', error);
      throw error;
    }
  };

  const parseMenuText = (rawText: string) => {
    const lines = rawText.split('\n'); 
    const parsedData: any[] = [];
    let currentDish: { name: string; price: string; description: string } | null = null;

    lines.forEach((line) => {
      const priceMatch = line.match(/\$[0-9]+(\.[0-9][0-9])?/); 

      if (priceMatch) {
        
        const price = priceMatch[0];
        const name = line.replace(price, '').trim(); 
        currentDish = { name, price, description: '' }; 
        parsedData.push(currentDish);
      } else if (currentDish && line.trim()) {
        
        currentDish.description += `${line.trim()}`;
      }
    });

    
    parsedData.forEach((dish) => {
      dish.description = dish.description.trim();
    });

    return parsedData;
  };

  const fetchDishImage = async (dishName: string) => {
    const endpoint = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(dishName)}&searchType=image`;

    try {
      const response = await axios.get(endpoint);

      const items = response.data.items || [];
      const imageUrl = items[0]?.link || null;
      const snippet = items[0]?.snippet || '';

      return { imageUrl, snippet };
    } catch (error) {
      
    }
  };

  const generateDishDescription = async (dishName: string) => {
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const prompt = `Write a very brief and simple description for the dish "${dishName}".`;
  
    try {
      const response = await axios.post(
        endpoint,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 50, 
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
  
      const content = response.data?.choices?.[0]?.message?.content;
      const isTruncated = response.data?.choices?.[0]?.finish_reason === 'length';
  
      if (!content) {
        console.error(`No content generated for "${dishName}". Response:`, response.data);
        return 'A delicious dish that everyone will love.';
      }
  
      const description = isTruncated ? `${content.trim()}...` : content.trim();
      console.log(`OpenAI API Response for "${dishName}":`, description);
      return description;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error generating dish description:', error.response?.data || error.message);
      } else {
        console.error('Error generating dish description:', error);
      }
      return 'A delicious dish that everyone will love.';
    }
  };
  
  

  const addImagesToDishes = async (dishes: { name: string; price: string; description: string }[]) => {
    const updatedDishes = await Promise.all(
      dishes.map(async (dish: { name: string; price: string; description: string }) => {
        const result = await fetchDishImage(dish.name);
        const imageUrl = result?.imageUrl || null;
        const snippet = result?.snippet || '';
  
        
        const hasValidMenuDescription = dish.description && dish.description.trim();
  
        const isValidSnippet =
          snippet &&
          snippet.trim() &&
          !snippet.toLowerCase().includes('recipe') && 
          !snippet.toLowerCase().includes('reason why'); 
  
        
        const description = hasValidMenuDescription
          ? dish.description.trim()
          : isValidSnippet
          ? snippet.trim()
          : await generateDishDescription(dish.name); 
  
        return {
          ...dish,
          imageUrl,
          description,
        };
      })
    );
  
    return updatedDishes;
  };
  

  return (
    <View style={styles.container}>
      {isCameraActive ? (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <AntDesign name="retweet" size={44} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
              <AntDesign name="camera" size={44} color="black" />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        <View style={styles.previewContainer}>
          <ScrollView horizontal>
            {photos.map((photo, index) => (
              <View key={index} style={styles.previewItem}>
                <Image source={{ uri: photo.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => handleRetakePhoto(index)}
                >
                  <AntDesign name="delete" size={24} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          {isProcessing ? (
            <ActivityIndicator size="large" color="#00ff00" />
          ) : (
            <>
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddAnotherPhoto}>
                <Text style={styles.addPhotoText}>Add Another Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.processButton} onPress={handleProcessMenu}>
                <Text style={styles.processText}>Process Menu</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      {ocrResults.length > 0 && (
        <ScrollView style={styles.resultsContainer}>
          {ocrResults.map((item, index) => (
            <View key={index} style={styles.dishContainer}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.dishImage} />
              )}
              <Text style={styles.dishName}>{item.name}</Text>
              <Text style={styles.dishPrice}>{item.price}</Text>
              {item.description && (
                <Text style={styles.dishDescription}>{item.description}</Text>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  buttonContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
    width: '100%',
    justifyContent: 'space-evenly',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: { flex: 1, padding: 10 },
  previewItem: { marginHorizontal: 5 },
  previewImage: { width: 100, height: 100, borderRadius: 5 },
  retakeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'red',
    borderRadius: 15,
    padding: 5,
  },
  addPhotoButton: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: 'blue',
    borderRadius: 10,
    alignItems: 'center',
  },
  addPhotoText: { color: 'white', fontSize: 16 },
  processButton: {
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 10,
    alignItems: 'center',
  },
  processText: { color: 'white', fontSize: 18 },
  permissionText: {
    color: 'white',
    fontSize: 16,
  },
  permissionButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  resultsContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
  dishContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff', 
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000', 
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5, 
  },
  dishImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  dishTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333', 
  },
  dishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center',
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 15,
    marginBottom: 10,
    lineHeight: 20,
    textAlign: 'justify',
  },
  dishPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 5,
  },
});
