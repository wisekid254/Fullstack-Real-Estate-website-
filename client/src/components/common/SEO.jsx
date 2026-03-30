import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "nestHaven — Find your perfect home",
  description = "Search thousands of properties for sale and rent across Kenya. Connect with verified agents on nestHaven.",
  image = "/og-image.jpg",
}) {
  const fullTitle = title.includes("nestHaven")
    ? title
    : `${title} | nestHaven`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
