import { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL;

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editTask, setEditTask] = useState('');

  const fetchTodos = async () => {
    const res = await fetch(`${API}/todos`);
    setTodos(await res.json());
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async () => {
    if (!task.trim()) return;
    await fetch(`${API}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
    });
    setTask('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
    fetchTodos();
  };

  const updateTodo = async (id) => {
    await fetch(`${API}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: editTask, completed: false }),
    });
    setEditId(null);
    fetchTodos();
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Todo App</h1>
      <input value={task} onChange={e => setTask(e.target.value)}
        placeholder="New task..." style={{ width: '70%', padding: 8 }} />
      <button onClick={addTodo} style={{ padding: 8 }}>Add</button>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
        {todos.map(t => (
          <li key={t.id} style={{ marginBottom: 10 }}>
            {editId === t.id ? (
              <>
                <input value={editTask} onChange={e => setEditTask(e.target.value)} />
                <button onClick={() => updateTodo(t.id)}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ marginRight: 10 }}>{t.task}</span>
                <button onClick={() => { setEditId(t.id); setEditTask(t.task); }}>Edit</button>
                <button onClick={() => deleteTodo(t.id)} style={{ marginLeft: 5 }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;