const HTML: FC<{
  mode: string;
}> = ({
  mode,
  children
}) => (
  <html>
    <head>
      <title>San Diego Design Week</title>

      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

      <meta name="description" content="" />
      <meta name="keywords" content="" />
      <meta name="author" content="" />

      <link rel="icon" href="/assets/images/favicon.ico" />

      <meta name="robots" content="noindex, nofollow" />

      <meta property="og:image" content="" />
      <meta property="og:site_name" content="" />
      <meta property="og:type" content="article" />
      <meta property="og:url" content="" />
      <meta property="og:title" content="" />
      <meta property="og:description" content="" />
      <meta property="fb:app_id" content="" />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content="" />
      <meta name="twitter:url" content="" />
      <meta name="twitter:title" content="" />
      <meta name="twitter:description" content="" />
      <meta name="twitter:image:src" content="" />

      {mode === 'production' && <link rel="stylesheet" href="/assets/css/main.bundle.css" />}
    </head>
    <body>
      {children}
      <script src="/assets/js/main.bundle.js"></script>
    </body>
  </html>
);

export default HTML;