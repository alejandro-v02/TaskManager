import React, { useCallback, useEffect, useState } from 'react';
import {
  View, ScrollView, Text, StyleSheet,
  ActivityIndicator, RefreshControl, StatusBar,
} from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Database, Q } from '@nozbe/watermelondb';
import type { Observable } from 'rxjs';
import type { TaskModel } from '../../data/local/TaskModel';
import { FilterType } from '../../domain/entities';
import { useTaskStore } from '../../store/taskStore';
import { syncTodos } from '../../data/sync/syncService';
import { FilterBar } from '../../ui/components/FilterBar';
import { TaskItem } from '../../ui/components/TaskItem';
import { AvatarView } from '../../ui/components/AvatarView';

// Nombre del usuario actual — alimenta el AvatarView del header
const CURRENT_USER_NAME = 'Alejandro Vitovis';

interface DatabaseProps {
  database: Database;
}

interface EnhancedProps {
  tasks: TaskModel[];
  database: Database;
}

// Construye un observable que lee tareas desde la BD local según el filtro activo.
// Al usar .observe(), cualquier cambio en WatermelonDB actualiza la UI automáticamente
function buildTasksObservable(database: Database, filter: FilterType): Observable<TaskModel[]> {
  const collection = database.get<TaskModel>('tasks');
  switch (filter) {
    case FilterType.COMPLETED: return collection.query(Q.where('completed', true)).observe();
    case FilterType.PENDING:   return collection.query(Q.where('completed', false)).observe();
    default:                   return collection.query().observe(); // ALL
  }
}

interface TaskListProps extends EnhancedProps {
  filter: FilterType;
}

function TaskList({ tasks, database, filter }: TaskListProps): React.JSX.Element {
  const { isSyncing, setSyncing, setSyncError } = useTaskStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const safeTasks = tasks ?? []; // evita crash si tasks llega undefined

  // Al montar la pantalla por primera vez, sincroniza la API con la BD local
  useEffect(() => {
    void (async () => {
      setSyncing(true);
      try {
        await syncTodos(database); // consume dummyjson y guarda en WatermelonDB
        setSyncError(null);
      } catch (e) {
        setSyncError(e instanceof Error ? e.message : 'Sync failed');
      } finally {
        setSyncing(false);
      }
    })();
  }, []);

  // Pull-to-refresh: el usuario desliza hacia abajo para volver a sincronizar
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await syncTodos(database);
      setSyncError(null);
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setIsRefreshing(false);
    }
  }, [database, setSyncError]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      // Habilita el gesto de pull-to-refresh en la lista
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void handleRefresh()}
          tintColor="#7C3AED"
          colors={['#7C3AED']}
        />
      }
    >
      {/* Header: título de la app + avatar del usuario actual */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Task Manager</Text>
            {/* Muestra cuántas tareas hay según el filtro activo */}
            <Text style={styles.headerSubtitle}>
              {safeTasks.length} {filter === FilterType.ALL ? 'tareas' : 'resultados'}
            </Text>
          </View>
          {/* Componente nativo: círculo con iniciales "AV" y color único */}
          <AvatarView name={CURRENT_USER_NAME} size={48} />
        </View>
      </View>

      {/* Barra de filtros: Todas / Completadas / Pendientes */}
      <FilterBar />

      {/* Indicador de sincronización visible solo cuando no es pull-to-refresh */}
      {isSyncing && !isRefreshing && (
        <View style={styles.syncIndicator}>
          <ActivityIndicator size="small" color="#7C3AED" />
          <Text style={styles.syncText}>Sincronizando…</Text>
        </View>
      )}

      {/* Lista de tareas o mensaje vacío */}
      {safeTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyText}>
            {isSyncing ? 'Cargando tareas…' : 'No hay tareas aquí'}
          </Text>
        </View>
      ) : (
        // Cada tarea es un componente reutilizable con su propio observable
        safeTasks.map((item) => <TaskItem key={item.id} task={item} />)
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// withObservables: re-renderiza TaskList automáticamente cuando cambian
// las tareas en WatermelonDB o cuando el usuario cambia el filtro
const EnhancedTaskList = withObservables<TaskListProps, { tasks: Observable<TaskModel[]> }>(
  ['filter', 'database'],
  ({ filter, database }: TaskListProps) => ({
    tasks: buildTasksObservable(database, filter),
  }),
)(TaskList);

function DashboardScreenInner({ database }: { database: Database }): React.JSX.Element {
  // Lee el filtro activo desde Zustand (solo estado de UI, no datos)
  const filter = useTaskStore((state) => state.filter);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F1A" />
      <EnhancedTaskList database={database} filter={filter} tasks={[]} />
    </View>
  );
}

// withDatabase: inyecta automáticamente la instancia de WatermelonDB como prop
export const DashboardScreen = withDatabase(DashboardScreenInner);

const styles = StyleSheet.create({
  screen:          { flex: 1, backgroundColor: '#0F0F1A' },
  listContent:     { paddingBottom: 32 },
  header:          { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  headerTop:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText:      { flex: 1 },
  headerTitle:     { color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle:  { color: '#6B7280', fontSize: 13, marginTop: 2 },
  syncIndicator:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 4, gap: 6 },
  syncText:        { color: '#6B7280', fontSize: 12 },
  emptyContainer:  { alignItems: 'center', justifyContent: 'center', paddingTop: 64, gap: 12 },
  emptyIcon:       { fontSize: 48 },
  emptyText:       { color: '#6B7280', fontSize: 16 },
});