import { Link } from 'react-router-dom';
import '../styles/ResourceGuideFooter.scss';

export default function ResourceGuideFooter() {
  return (
    <aside className="resource-guide-footer" aria-label="Study guidance">
      <h2>Not sure where to start?</h2>
      <p>Build your VCE Units 3 and 4 revision routine with summaries, practice questions and practice SACs.</p>
      <Link to="/how-to-use-chuba">How to use Chuba's VCE resources</Link>
    </aside>
  );
}
