import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewPost {
  info: string;
  user: string;
  details: string;
  status: string;
  images: any[];
  location:string
}

export default function CreatePostScreen() {
  const [newPost, setNewPost] = useState<NewPost>({
    info: '',
    user: '',
    details: '',
    status: 'publicado',
    images: [],
    location: ''
  });

  const handleTitleChange = (text: string) => {
    setNewPost({ ...newPost, details: text });
  };

  const handleInfoChange = (text: string) => {
    setNewPost({ ...newPost, info: text });
  };
  const handleStatusChange = (text: string) => {
    setNewPost({ ...newPost, status: text });
  };

  const pickImages = async () => {
    if (newPost.images.length >= 4) {
      Alert.alert('Limite de Imagens', 'Você só pode adicionar até 4 imagens.');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permissão negada!", "Você precisa permitir o acesso à galeria para escolher uma imagem.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4 - newPost.images.length,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setNewPost((prevState) => ({
        ...prevState,
        images: [...prevState.images, ...selectedImages].slice(0, 4),
      }));
    }
  };

  const removeImage = (index: number) => {
    setNewPost((prevState) => ({
      ...prevState,
      images: prevState.images.filter((_, i) => i !== index),
    }));
  };

  const handleSavePost = async () => {
    if (newPost.details && newPost.info && newPost.images.length > 0) {
      const user = (await AsyncStorage.getItem('userId')) ?? '';
      const formData = new FormData();
      formData.append('description', newPost.details);
      formData.append('info', newPost.info);
      formData.append('userId', user);
      formData.append('status', 'publicado');
      formData.append('location', 'Marilia');

      for (const [index, imageUri] of newPost.images.entries()) {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        // Nome do arquivo (extraído do URI ou um nome genérico)
        const fileName = imageUri.split('/').pop() || `image_${index}.jpg`;

        // Corrigir o append para passar o Blob e o nome corretamente
        formData.append('images', blob, fileName);
      }

      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/publications`, {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.ok) {
          Alert.alert("Publicação Criada", "Sua publicação foi criada com sucesso!");
          setNewPost({
            details: '',
            user: '',
            info: '',
            status: 'publicado',
            images: [],
            location: '',
          });
        } else {
          Alert.alert("Erro", "Ocorreu um erro ao criar a publicação.");
        }
      } catch (error) {
        Alert.alert("Erro", "Erro ao enviar a publicação. Tente novamente.");
      }
    } else {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
    }
  };





  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.container}>
          <Text style={{ marginVertical: 20, textAlign: 'center', fontSize: 16, fontWeight: '500', color: 'gray' }}>
            Nova publicação
          </Text>

          <Text style={styles.label}>Imagens (até 4):</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
            <Text style={styles.imageButtonText}>Escolher Imagens</Text>
          </TouchableOpacity>

          <View style={styles.imagePreviewContainer}>
            {newPost.images.map((imageUri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                  <Text style={styles.removeButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.label}>Situalção do animal:</Text>
          <TextInput
            style={styles.input}
            value={newPost.status}
            onChangeText={handleStatusChange}
            placeholder="Animal perdido"
          />

          <Text style={styles.label}>Detalhes:</Text>
          <TextInput
            style={styles.input}
            value={newPost.details}
            onChangeText={handleTitleChange}
            placeholder="Informe os detalhes para publicação"
          />

          <Text style={styles.label}>Informações para contato:</Text>
          <TextInput
            style={styles.input}
            value={newPost.info}
            onChangeText={handleInfoChange}
            placeholder="Digite o nome do usuário"
          />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.buttonPub} onPress={handleSavePost}>
        <Text style={styles.buttonText}>Publicar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    color: 'gray',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: '#D94509',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  imageWrapper: {
    position: 'relative',
    margin: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#ff0000',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonPub: {
    backgroundColor: '#D94509',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
