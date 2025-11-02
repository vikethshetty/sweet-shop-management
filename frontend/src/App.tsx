import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  email: string;
  role: string;
}

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Login Form Component
const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => void;
  onSwitchToRegister: () => void;
  loading: boolean;
  error: string;
}> = ({ onLogin, onSwitchToRegister, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <h2>Login to Sweet Shop</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="link-button">
          Register here
        </button>
      </p>
    </div>
  );
};

// Register Form Component
const RegisterForm: React.FC<{
  onRegister: (email: string, password: string) => void;
  onSwitchToLogin: () => void;
  loading: boolean;
  error: string;
}> = ({ onRegister, onSwitchToLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(email, password);
  };

  return (
    <div className="auth-container">
      <h2>Register for Sweet Shop</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="link-button">
          Login here
        </button>
      </p>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC<{
  sweets: Sweet[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onPurchase: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (sweet: Sweet) => void;
  onAddSweet: () => void;
  isAdmin: boolean;
}> = ({ sweets, searchTerm, onSearchChange, onPurchase, onDelete, onEdit, onAddSweet, isAdmin }) => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search sweets by name or category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        
        {isAdmin && (
          <div className="admin-header">
            <button className="add-sweet-btn" onClick={onAddSweet}>
              + Add New Sweet
            </button>
          </div>
        )}
      </div>

      <div className="sweets-grid">
        {sweets.map(sweet => (
          <div key={sweet.id} className="sweet-card">
            <h3>{sweet.name}</h3>
            <p className="category">Category: {sweet.category}</p>
            <p className="price">Price: ${sweet.price}</p>
            <p className="quantity">In stock: {sweet.quantity}</p>
            
            <button
              onClick={() => onPurchase(sweet.id)}
              disabled={sweet.quantity === 0}
              className={`purchase-btn ${sweet.quantity === 0 ? 'disabled' : ''}`}
            >
              {sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
            </button>

            {isAdmin && (
              <div className="admin-actions">
                <button 
                  className="edit-btn"
                  onClick={() => onEdit(sweet)}
                >
                  Edit
                </button>
                <button 
                  className="delete-btn"
                  onClick={() => onDelete(sweet.id)}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {sweets.length === 0 && (
        <div className="no-sweets">
          <p>No sweets found. {searchTerm && 'Try a different search term.'}</p>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
      fetchSweets(savedToken);
    }
  }, []);

  const fetchSweets = async (token: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/sweets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSweets(data);
      } else {
        setError('Failed to fetch sweets');
      }
    } catch (error) {
      setError('Network error while fetching sweets');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setCurrentView('dashboard');
        fetchSweets(data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setCurrentView('dashboard');
        fetchSweets(data.token);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSweets([]);
    setCurrentView('login');
  };

  const handlePurchase = async (sweetId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: 1 })
      });

      if (response.ok) {
        // Refresh the sweets list
        fetchSweets(token!);
        alert('Purchase successful!');
      } else {
        const errorData = await response.json();
        alert(`Purchase failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error purchasing sweet:', error);
      alert('Network error during purchase');
    }
  };

  const handleDelete = async (sweetId: number) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sweets/${sweetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh the sweets list
        fetchSweets(token!);
        alert('Sweet deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Delete failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error deleting sweet:', error);
      alert('Network error during delete');
    }
  };

  const handleEdit = (sweet: Sweet) => {
    const newName = prompt('Enter new name:', sweet.name);
    const newCategory = prompt('Enter new category:', sweet.category);
    const newPrice = prompt('Enter new price:', sweet.price.toString());
    const newQuantity = prompt('Enter new quantity:', sweet.quantity.toString());

    if (newName && newCategory && newPrice && newQuantity) {
      updateSweet(sweet.id, newName, newCategory, parseFloat(newPrice), parseInt(newQuantity));
    }
  };

  const updateSweet = async (id: number, name: string, category: string, price: number, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/sweets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, category, price, quantity })
      });

      if (response.ok) {
        // Refresh the sweets list
        fetchSweets(token!);
        alert('Sweet updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating sweet:', error);
      alert('Network error during update');
    }
  };

  const handleAddSweet = () => {
    const name = prompt('Enter sweet name:');
    const category = prompt('Enter category:');
    const price = prompt('Enter price:');
    const quantity = prompt('Enter quantity:');

    if (name && category && price && quantity) {
      addSweet(name, category, parseFloat(price), parseInt(quantity));
    }
  };

  const addSweet = async (name: string, category: string, price: number, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/sweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, category, price, quantity })
      });

      if (response.ok) {
        // Refresh the sweets list
        fetchSweets(token!);
        alert('Sweet added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Add failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding sweet:', error);
      alert('Network error during add');
    }
  };

  const filteredSweets = sweets.filter(sweet =>
    sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <header className="app-header">
        <h1>🍬 Sweet Shop Management</h1>
        {user && (
          <div className="user-info">
            <span>Welcome, {user.email} ({user.role})</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {currentView === 'login' && (
          <LoginForm 
            onLogin={handleLogin}
            onSwitchToRegister={() => setCurrentView('register')}
            loading={loading}
            error={error}
          />
        )}
        
        {currentView === 'register' && (
          <RegisterForm 
            onRegister={handleRegister}
            onSwitchToLogin={() => setCurrentView('login')}
            loading={loading}
            error={error}
          />
        )}
        
        {currentView === 'dashboard' && user && (
          <Dashboard 
            sweets={filteredSweets}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onPurchase={handlePurchase}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onAddSweet={handleAddSweet}
            isAdmin={user.role === 'admin'}
          />
        )}
      </main>
    </div>
  );
}

export default App;