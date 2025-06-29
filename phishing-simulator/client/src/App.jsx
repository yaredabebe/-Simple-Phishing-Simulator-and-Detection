import React from 'react';
import { Routes, Route ,BrowserRouter} from 'react-router-dom';
import FakeLogin from './pages/FakeLogin';
import AwarenessPage from './pages/AwarenessPage'; // create this next
import BankLogin  from './pages/BankLogin'

const App = () => {
  return (
<BrowserRouter>
<Routes>
      <Route path="/" element={<BankLogin />} />
       <Route path="/2f" element={<FakeLogin />} />
      <Route path="/awareness" element={<AwarenessPage />} />
    </Routes>
</BrowserRouter>
    
    
  );
};

export default App;

