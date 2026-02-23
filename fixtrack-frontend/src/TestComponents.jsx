import { useState } from 'react';
import Button from './components/common/Button';
import Badge from './components/common/Badge';
import Modal from './components/common/Modal';
import LoadingSpinner from './components/common/LoadingSpinner';

export default function TestComponents() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: '40px', backgroundColor: '#F3F4F6', minHeight: '100vh' }}>
      <h1 style={{ color: '#111827', marginBottom: '40px' }}>Test Composants Oumayma</h1>

      {/* Boutons */}
      <Button label="Test" onClick={() => alert('Clicked!')} />
      {/* ... ajoute le reste ici */}
    </div>
  );
}