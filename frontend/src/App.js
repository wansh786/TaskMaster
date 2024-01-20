import logo from './logo.svg';
import './App.css';
import Headers from './components/Headers';
import Login from './components/Login';
import Error from './components/Error';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import {Routes,Route} from "react-router-dom"

function App() {
  return (
    <div className="App">
      <Headers/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='*' element={<Error/>}/>
      </Routes>
    </div>
  );
}

export default App;
