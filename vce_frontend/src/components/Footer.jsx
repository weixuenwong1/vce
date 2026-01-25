import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
      <div className="footer-grid">
        <div>
          <h4>Physics</h4>
          <ul>
            <li><Link to="/summaries/physics">Topic Summary</Link></li>
            <li><Link to="/practice/physics">Practice Questions</Link></li>
            <li><Link to="/practice-sac/physics">Practice SAC</Link></li>
          </ul>
        </div>
        <div>
          <h4>Chemistry</h4>
          <ul>
            <li><Link to="/summaries/chemistry">Topic Summary</Link></li>
            <li><Link to="/practice/chemistry">Practice Questions</Link></li>
            <li><Link to="/practice-sac/chemistry">Practice SAC</Link></li>
          </ul>
        </div>
        <div>
          <h4>Biology</h4>
          <ul>
            <li><Link to="/summaries/biology/">Topic Summary</Link></li>
            <li><Link to="/practice/biology/">Practice Questions</Link></li>
            <li><Link to="/practice-sac/biology/">Practice SAC</Link></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <p>support@chuba.io</p>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      </div>
      <p className="footer-bottom">© {new Date().getFullYear()} chuba.io. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
