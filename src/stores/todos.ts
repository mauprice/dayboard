import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useStorage } from '@/composables/useStorage';
import { createSyncedStore } from '@/services/storage';
import { DEFAULT_TODO_DATA, migrateTodos } from '@/types/storage';

const todoStore = createSyncedStore('dayboard:todos', DEFAULT_TODO_DATA, migrateTodos);

export const useTodoStore = defineStore('todos', () => {
  const { state: todos, ready } = useStorage(todoStore, DEFAULT_TODO_DATA);

  const activeList = computed(
    () => todos.value.lists.find((list) => list.id === todos.value.activeListId) ?? todos.value.lists[0],
  );

  function setActiveList(id: string) {
    if (todos.value.lists.some((list) => list.id === id)) todos.value.activeListId = id;
  }

  function addList(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = crypto.randomUUID();
    todos.value.lists.push({ id, name: trimmed, items: [] });
    todos.value.activeListId = id;
  }

  function removeList(id: string) {
    if (todos.value.lists.length <= 1) return;
    todos.value.lists = todos.value.lists.filter((list) => list.id !== id);
    if (todos.value.activeListId === id) {
      todos.value.activeListId = todos.value.lists[0]!.id;
    }
  }

  function addItem(text: string) {
    const trimmed = text.trim();
    const list = activeList.value;
    if (!trimmed || !list) return;
    list.items.push({ id: crypto.randomUUID(), text: trimmed, completed: false, completedAt: null });
  }

  function editItem(listId: string, itemId: string, text: string) {
    const item = todos.value.lists.find((list) => list.id === listId)?.items.find((i) => i.id === itemId);
    if (item) item.text = text.trim();
  }

  function toggleItem(listId: string, itemId: string, todayKey: string) {
    const item = todos.value.lists.find((list) => list.id === listId)?.items.find((i) => i.id === itemId);
    if (!item) return;
    item.completed = !item.completed;
    item.completedAt = item.completed ? todayKey : null;
  }

  function removeItem(listId: string, itemId: string) {
    const list = todos.value.lists.find((l) => l.id === listId);
    if (!list) return;
    list.items = list.items.filter((item) => item.id !== itemId);
  }

  function reorderItem(listId: string, fromIndex: number, toIndex: number) {
    const list = todos.value.lists.find((l) => l.id === listId);
    if (!list) return;
    const [moved] = list.items.splice(fromIndex, 1);
    if (moved) list.items.splice(toIndex, 0, moved);
  }

  function setAutoClear(days: number | null) {
    todos.value.autoClearCompletedAfterDays = days;
  }

  return {
    todos,
    ready,
    activeList,
    setActiveList,
    addList,
    removeList,
    addItem,
    editItem,
    toggleItem,
    removeItem,
    reorderItem,
    setAutoClear,
  };
});
