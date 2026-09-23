import '../styles/ResourceCatalogueLoading.scss';

export default function ResourceCatalogueLoading({ label = 'Loading resources' }) {
  return (
    <div className="catalogue-loading" role="status" aria-live="polite" aria-label={label}>
      {[0, 1, 2].map((item) => (
        <div className="catalogue-loading__chapter" key={item} aria-hidden="true">
          <div className="catalogue-loading__heading" />
          <div className="catalogue-loading__panel">
            <div className="catalogue-loading__description">
              <span /><span /><span />
            </div>
            <div className="catalogue-loading__topics">
              <span /><span /><span />
            </div>
          </div>
        </div>
      ))}
      <span className="catalogue-loading__text">{label}...</span>
    </div>
  );
}
