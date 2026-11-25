<script setup lang="ts">
import { ref } from 'vue';
import { useTodoStore } from '@/stores/todos';
import { useMidnight } from '@/composables/useMidnight';

const todos = useTodoStore();
const { today } = useMidnight();

const open = ref(false);
const newItemText = ref('');
const newListName = ref('');
const addingList = ref(false);
const editingId = ref<string | null>(null);
const editDraft = ref('');
const dragIndex = ref<number | null>(null);

function submitNewItem() {
  todos.addItem(newItemText.value);
  newItemText.value = '';
}

function submitNewList() {
  if (newListName.value.trim()) todos.addList(newListName.value);
  newListName.value = '';
  addingList.value = false;
}

function startEdit(id: string, text: string) {
  editingId.value = id;
  editDraft.value = text;
}

function commitEdit(listId: string) {
  if (editingId.value) todos.editItem(listId, editingId.value, editDraft.value);
  editingId.value = null;
}

function onDrop(listId: string, index: number) {
  if (dragIndex.value !== null && dragIndex.value !== index) {
    todos.reorderItem(listId, dragIndex.value, index);
  }
  dragIndex.value = null;
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-20 flex flex-col items-end gap-2">
    <div
      v-if="open && todos.activeList"
      class="flex max-h-[70vh] w-80 flex-col overflow-hidden rounded-xl bg-neutral-900/90 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm"
    >
      <div class="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-3 py-2">
        <button
          v-for="list in todos.todos.lists"
          :key="list.id"
          type="button"
          class="shrink-0 rounded px-2 py-1 text-sm"
          :class="list.id === todos.todos.activeListId ? 'bg-white/20' : 'text-white/60 hover:bg-white/10'"
          @click="todos.setActiveList(list.id)"
        >{{ list.name }}</button>
        <button
          type="button"
          class="shrink-0 rounded px-2 py-1 text-sm text-white/50 hover:bg-white/10"
          @click="addingList = !addingList"
        >+</button>
      </div>

      <form v-if="addingList" class="flex gap-2 border-b border-white/10 px-3 py-2" @submit.prevent="submitNewList">
        <input
          v-model="newListName"
          type="text"
          autofocus
          placeholder="List name"
          class="flex-1 rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/20 focus:ring-white/60"
        />
        <button type="submit" class="rounded bg-white/90 px-2 py-1 text-sm text-neutral-900">Add</button>
      </form>

      <ul class="flex-1 overflow-y-auto px-2 py-2">
        <li
          v-for="(item, index) in todos.activeList.items"
          :key="item.id"
          draggable="true"
          class="group flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/5"
          @dragstart="dragIndex = index"
          @dragover.prevent
          @drop="onDrop(todos.activeList!.id, index)"
        >
          <input
            type="checkbox"
            :checked="item.completed"
            class="h-4 w-4 shrink-0 accent-white"
            @change="todos.toggleItem(todos.activeList!.id, item.id, today)"
          />
          <input
            v-if="editingId === item.id"
            v-model="editDraft"
            type="text"
            autofocus
            class="flex-1 rounded bg-white/10 px-1 text-sm outline-none ring-1 ring-white/30"
            @keyup.enter="commitEdit(todos.activeList!.id)"
            @keyup.escape="editingId = null"
            @blur="commitEdit(todos.activeList!.id)"
          />
          <span
            v-else
            class="flex-1 cursor-text truncate text-sm"
            :class="{ 'line-through opacity-50': item.completed }"
            @click="startEdit(item.id, item.text)"
          >{{ item.text }}</span>
          <button
            type="button"
            class="shrink-0 text-white/30 opacity-0 hover:text-white/80 group-hover:opacity-100"
            @click="todos.removeItem(todos.activeList!.id, item.id)"
          >✕</button>
        </li>
        <li v-if="!todos.activeList.items.length" class="px-2 py-4 text-center text-sm text-white/40">
          Nothing here yet.
        </li>
      </ul>

      <form class="flex gap-2 border-t border-white/10 px-3 py-2" @submit.prevent="submitNewItem">
        <input
          v-model="newItemText"
          type="text"
          placeholder="Add a to-do…"
          class="flex-1 rounded bg-white/10 px-2 py-1 text-sm outline-none ring-1 ring-white/20 focus:ring-white/60"
        />
      </form>
    </div>

    <button
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg font-medium text-neutral-900 shadow-lg hover:bg-white"
      @click="open = !open"
    >{{ open ? '✕' : '☰' }}</button>
  </div>
</template>
