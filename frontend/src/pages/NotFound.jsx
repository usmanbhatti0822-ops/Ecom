import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container page" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  );
}
