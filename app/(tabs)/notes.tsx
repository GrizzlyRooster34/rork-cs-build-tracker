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
  Alert
} from 'react-native';
import { Stack } from 'expo-router';
import { theme, globalStyles } from '@/constants/theme';
import { useNotesStore } from '@/store/notesStore';
import EmptyState from '@/components/EmptyState';
import { formatDate, getCurrentDate } from '@/utils/dateFormatter';
import { Plus, X, FileText, Edit, Trash2 } from 'lucide-react-native';

export default function NotesScreen() {
  const { notes, addNote, updateNote, deleteNote } = useNotesStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  
  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleAddNote = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    if (!content.trim()) {
      Alert.alert('Error', 'Content is required');
      return;
    }
    
    const tagsList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    if (editMode && selectedNote) {
      updateNote(selectedNote, {
        title,
        content,
        tags: tagsList,
      });
    } else {
      addNote({
        title,
        content,
        tags: tagsList,
        date: getCurrentDate(),
      });
    }
    
    // Reset form
    setTitle('');
    setContent('');
    setTags('');
    setEditMode(false);
    setSelectedNote(null);
    setModalVisible(false);
  };
  
  const handleEditNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(', '));
      setEditMode(true);
      setSelectedNote(id);
      setModalVisible(true);
    }
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        title: 'Notes & Journal',
        headerRight: () => (
          <Pressable 
            onPress={() => {
              setTitle('');
              setContent('');
              setTags('');
              setEditMode(false);
              setSelectedNote(null);
              setModalVisible(true);
            }}
            style={({ pressed }) => [
              styles.addButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Plus size={24} color={theme.colors.text} />
          </Pressable>
        )
      }} />
      
      {notes.length > 0 ? (
        <ScrollView style={styles.list}>
          {sortedNotes.map(note => (
            <View key={note.id} style={styles.item}>
              <View style={styles.itemHeader}>
                <View style={styles.titleContainer}>
                  <FileText size={20} color={theme.colors.tint} style={styles.icon} />
                  <Text style={styles.itemTitle}>{note.title}</Text>
                </View>
                <Text style={styles.itemDate}>{formatDate(note.date)}</Text>
              </View>
              
              <Text style={styles.itemContent} numberOfLines={5}>
                {note.content}
              </Text>
              
              {note.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {note.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditNote(note.id)}
                >
                  <Edit size={16} color={theme.colors.text} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    Alert.alert(
                      'Delete Note',
                      'Are you sure you want to delete this note?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Delete', 
                          style: 'destructive',
                          onPress: () => deleteNote(note.id)
                        }
                      ]
                    );
                  }}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <EmptyState 
          title="No Notes"
          message="Your notes list is empty. Add your first note by tapping the + button."
        />
      )}
      
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
                {editMode ? 'Edit Note' : 'Add Note'}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Note title..."
                placeholderTextColor={theme.colors.subtext}
                value={title}
                onChangeText={setTitle}
              />
              
              <Text style={styles.inputLabel}>Content *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Write your note here..."
                placeholderTextColor={theme.colors.subtext}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={10}
              />
              
              <Text style={styles.inputLabel}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="fuel test, suspension tweak, etc."
                placeholderTextColor={theme.colors.subtext}
                value={tags}
                onChangeText={setTags}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddNote}
              >
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Note' : 'Add Note'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  addButton: {
    marginRight: 16,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  itemContent: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: theme.colors.tint + '33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.tint,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: theme.colors.tint + '33',
  },
  deleteButton: {
    backgroundColor: theme.colors.error + '22',
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 4,
  },
  deleteText: {
    color: theme.colors.error,
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
    minHeight: 200,
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
});