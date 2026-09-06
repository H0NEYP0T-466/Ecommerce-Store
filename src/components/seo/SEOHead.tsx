import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}

export default function SEOHead({
  title = 'Hamid Cloth House | Premium Pakistani Clothing',
  description = 'Shop the finest Pakistani men\'s and women\'s clothing, Kurtas, Shalwar Kameez, Waistcoats, and Shawls from Hamid Cloth House.',
  keywords = [],
  image = '/logo.jpg',
  url,
  type = 'website',
}: SEOHeadProps) {
  const fullTitle = title.includes('Hamid Cloth House')
    ? title
    : `${title} | Hamid Cloth House`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}

      {/* OpenGraph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
