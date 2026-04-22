import React, { useCallback } from 'react';
import {View,Text,Switch,TouchableOpacity,Image,StyleSheet,Alert, } from 'react-native';
import withObservables from '@nozbe/with-observables';
import type { TaskModel } from '../../data/local/TaskModel';
import { toggleTaskCompletion, saveAttachmentUri } from '../../data/sync/syncService';
import { CameraModule } from '../../modules/CameraModule/CameraModule';

interface TaskItemProps {
  task: TaskModel;
}

// Componente interno — recibe el task ya observado
function TaskItemInner({ task }: TaskItemProps): React.JSX.Element {
  const handleToggle = useCallback(
    async (value: boolean) => {
      try {
        await toggleTaskCompletion(task, value);
      } catch (error) {
        console.error('[TaskItem] Failed to toggle task completion:', error);
      }
    },
    [task],
  );

  const handleAttachPhoto = useCallback(async () => {
    try {
      const result = await CameraModule.openCamera();
      await saveAttachmentUri(task, result.uri);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo abrir la cámara';
      if (
        !message.includes('cancelled') &&
        !message.includes('cancel') &&
        !message.includes('E_CANCELLED')
      ) {
        Alert.alert('Error', message);
      }
    }
  }, [task]);

  const handleDeletePhoto = useCallback(async () => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar la foto adjunta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveAttachmentUri(task, '');
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la foto');
            }
          },
        },
      ],
    );
  }, [task]);

  const hasPhoto = task.attachmentUri != null && task.attachmentUri.length > 0;

  return (
    <View style={styles.container}>
      {/* Ícono de tarea */}
      <View style={[styles.taskIcon, task.completed && styles.taskIconCompleted]}>
        <Text style={styles.taskIconText}>{task.completed ? '✓' : 'PD'}</Text>
      </View>

      {/* Contenido de la tarea */}
      <View style={styles.content}>
        <Text
          style={[styles.title, task.completed ? styles.titleCompleted : null]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        {hasPhoto ? (
          <View style={styles.thumbnailRow}>
            <Image
              source={{ uri: task.attachmentUri! }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.replaceButton} onPress={handleAttachPhoto}>
                <Text style={styles.replaceText}>Actualizar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePhoto}>
                <Text style={styles.deleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.attachButton} onPress={handleAttachPhoto}>
            <Text style={styles.attachText}>Adjuntar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Switch de completado */}
      <Switch
        value={task.completed}
        onValueChange={handleToggle}
        trackColor={{ false: '#374151', true: '#7C3AED' }}
        thumbColor={task.completed ? '#FFFFFF' : '#9CA3AF'}
        accessibilityLabel={`Marcar tarea como completada: ${task.title}`}
        testID={`switch-${task.id}`}
      />
    </View>
  );
}

// withObservables hace que el componente se re-renderice
// automáticamente cada vez que el task cambia en WatermelonDB
export const TaskItem = withObservables(['task'], ({ task }: TaskItemProps) => ({
  task: task.observe(),
}))(TaskItemInner);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E2E',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    gap: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D2D44',
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconCompleted: {
    backgroundColor: '#4C1D95',
    borderColor: '#7C3AED',
  },
  taskIconText: {
    fontSize: 16,
    color: '#A78BFA',
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  titleCompleted: {
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  attachButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 8,
  },
  attachText: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '500',
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  photoActions: {
    flexDirection: 'column',
    gap: 4,
  },
  replaceButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 8,
  },
  replaceText: {
    color: '#A78BFA',
    fontSize: 11,
    fontWeight: '500',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3D1A1A',
    borderRadius: 8,
  },
  deleteText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '500',
  },
});