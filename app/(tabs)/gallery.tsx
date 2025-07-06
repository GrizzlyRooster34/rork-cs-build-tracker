import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Dimensions
} from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { useGalleryStore } from '@/store/galleryStore';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { copyToClipboard } from '@/utils/copyToClipboard';
import { Plus, X, Camera, Image as ImageIcon, Share, Edit } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;

export default function GalleryScreen() {
  const { photos, addPhoto, updatePhoto, deletePhoto } = useGalleryStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  
  const handleAddPhoto = async () => {
    if (!imageUrl.trim()) {
      Alert.alert('Error', 'Image URL is required');
      return;
    }
    
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    const tagsList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const photoData = {
      url: imageUrl,
      title,
      description,
      tags: tagsList,
      date: getCurrentDate(),
      category: 'mod' as const,
    };

    if (editMode && selectedPhoto) {
      updatePhoto(selectedPhoto, photoData);
    } else {
      addPhoto(photoData);
    }
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setImageUrl('');
    setTitle('');
    setDescription('');
    setTags('');
    setEditMode(false);
    setSelectedPhoto(null);
    setModalVisible(false);
  };

  const handleEditPhoto = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      setImageUrl(photo.url);
      setTitle(photo.title);
      setDescription(photo.description);
      setTags(photo.tags.join(', '));
      setEditMode(true);
      setSelectedPhoto(id);
      setModalVisible(true);
    }
  };
  
  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      // In a real app, you would upload this to a server and get a URL
      // For this demo, we'll just use the local URI as a placeholder
      setImageUrl(result.assets[0].uri);
    }
  };
  
  const handleViewPhoto = (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
      setSelectedPhoto(id);
      setDetailModalVisible(true);
    }
  };
  
  const handleExportGallery = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'No photos to export');
      return;
    }
    
    const data = [
      'Photo Gallery Export',
      '==================',
      ...photos.map(photo => 
        `${photo.title} | ${formatDate(photo.date)} | Tags: ${photo.tags.join(', ')}`
      ),
      '',
      `Exported from CS Build Tracker - ${new Date().toLocaleDateString()}`
    ].join('\n');

    try {
      await copyToClipboard(data);
      Alert.alert('Exported', 'Gallery data copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to export gallery data');
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Photo Gallery',
        headerRight: () => (
          <View style={styles.headerButtons}>
            {photos.length > 0 && (
              <Pressable 
                onPress={handleExportGallery}
                style={({ pressed }) => [
                  styles.headerButton,
                  { opacity: pressed ? 0.7 : 1 }
                ]}
              >
                <Share size={20} color={theme.colors.text} />
              </Pressable>
            )}
            <Pressable 
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Plus size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        )
      }} />
      
      {photos.length > 0 ? (
        <ScrollView style={styles.gallery} contentContainerStyle={styles.galleryContent}>
          {photos.map(photo => (
            <TouchableOpacity 
              key={photo.id} 
              style={styles.photoItem}
              onPress={() => handleViewPhoto(photo.id)}
            >
              <Image 
                source={{ uri: photo.url }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.photoInfo}>
                <Text style={styles.photoTitle} numberOfLines={1}>
                  {photo.title}
                </Text>
                <Text style={styles.photoDate}>
                  {formatDate(photo.date)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <EmptyState 
          title="No Photos"
          message="Your gallery is empty. Add your first photo by tapping the + button."
        />
      )}
      
      {/* Add Photo Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Edit Photo' : 'Add Photo'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <View style={styles.imageInputContainer}>
                <TextInput
                  style={[styles.input, styles.imageUrlInput]}
                  placeholder="Image URL or use picker"
                  placeholderTextColor={theme.colors.subtext}
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
                <TouchableOpacity
                  style={styles.pickImageButton}
                  onPress={handlePickImage}
                >
                  <ImageIcon size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              {imageUrl ? (
                <View style={styles.previewContainer}>
                  <Image 
                    source={{ uri: imageUrl }} 
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                </View>
              ) : null}
              
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Front view, Engine bay, etc."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details about the photo..."
                placeholderTextColor={theme.colors.subtext}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="exterior, front, night, etc."
                placeholderTextColor={theme.colors.subtext}
                value={tags}
                onChangeText={setTags}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddPhoto}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Photo' : 'Add Photo'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={detailModalVisible}
          onRequestClose={() => {
            setDetailModalVisible(false);
            setSelectedPhoto(null);
          }}
        >
          <View style={styles.detailModalContainer}>
            <TouchableOpacity
              style={styles.closeDetailButton}
              onPress={() => {
                setDetailModalVisible(false);
                setSelectedPhoto(null);
              }}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            {(() => {
              const photo = photos.find(p => p.id === selectedPhoto);
              if (!photo) return null;
              
              return (
                <View style={styles.photoDetailContent}>
                  <Image 
                    source={{ uri: photo.url }} 
                    style={styles.fullImage}
                    resizeMode="contain"
                  />
                  
                  <View style={styles.photoDetailInfo}>
                    <Text style={styles.photoDetailTitle}>{photo.title}</Text>
                    <Text style={styles.photoDetailDate}>{formatDate(photo.date)}</Text>
                    
                    {photo.description ? (
                      <Text style={styles.photoDetailDescription}>
                        {photo.description}
                      </Text>
                    ) : null}
                    
                    {photo.tags.length > 0 ? (
                      <View style={styles.tagsContainer}>
                        {photo.tags.map((tag, index) => (
                          <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    
                    <View style={styles.photoActions}>
                      <TouchableOpacity
                        style={styles.editPhotoButton}
                        onPress={() => {
                          setDetailModalVisible(false);
                          handleEditPhoto(photo.id);
                        }}
                      >
                        <Edit size={16} color={theme.colors.text} />
                        <Text style={styles.editPhotoText}>Edit Photo</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.deletePhotoButton}
                        onPress={() => {
                          Alert.alert(
                            'Delete Photo',
                            'Are you sure you want to delete this photo?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { 
                                text: 'Delete', 
                                style: 'destructive',
                                onPress: () => {
                                  deletePhoto(photo.id);
                                  setDetailModalVisible(false);
                                  setSelectedPhoto(null);
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <X size={16} color={theme.colors.error} />
                        <Text style={styles.deletePhotoText}>Delete Photo</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })()}
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginRight: 16,
    padding: 4,
  },
  gallery: {
    flex: 1,
    padding: 16,
  },
  galleryContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoItem: {
    width: ITEM_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
  },
  thumbnail: {
    width: '100%',
    height: ITEM_WIDTH,
  },
  photoInfo: {
    padding: 8,
  },
  photoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  photoDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalForm: {
    maxHeight: '80%',
  },
  imageInputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageUrlInput: {
    flex: 1,
    marginBottom: 0,
  },
  pickImageButton: {
    backgroundColor: theme.colors.tint,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  previewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: 12,
    color: theme.colors.text,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: theme.colors.tint,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeDetailButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  photoDetailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: '60%',
  },
  photoDetailInfo: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  photoDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  photoDetailDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  photoDetailDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: 'rgba(61, 133, 198, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editPhotoText: {
    color: theme.colors.warning,
    marginLeft: 8,
  },
  deletePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  deletePhotoText: {
    color: theme.colors.error,
    marginLeft: 8,
  },
});