module.exports = {
  siteMetadata: {
    title: `Engineering processes applied to our daily life`,
    author: {
      name: `Felipe Schmitt`,
      summary: `Software Development, Product Engineering, Leadership, Culture, Photography and Traveling`,
      visit: [`🇦🇩`,`🇦🇹`,`🇧🇪`,`🇧🇬`,`🇭🇷`,`🇨🇿`,`🇩🇰`,`🏴󠁧󠁢󠁥󠁮󠁧󠁿`,`🇪🇪`,`🇫🇮`,`🇫🇷`,`🇩🇪`,`🇭🇺`,`🇮🇹`,`🇱🇻`,`🇱🇹`,`🇱🇺`,`🇲🇨`,`🇳🇴`,`🇵🇱`,`🇵🇹`,`🇷🇴`,`🇷🇺`,`🇷🇸`,`🇸🇰`,`🇪🇸`,`🇸🇪`,`🇨🇭`,`🇳🇱`,`🇻🇦`,`🇹🇷`,`🇧🇳`,`🇰🇭`,`🇨🇳`,`🇭🇰`,`🇮🇳`,`🇮🇱`,`🇯🇵`,`🇯🇴`,`🇱🇦`,`🇲🇴`,`🇲🇾`,`🇲🇲`,`🇵🇸`,`🇸🇬`,`🇿🇦`,`🇹🇼`,`🇹🇭`,`🇻🇳`,`🇦🇬`,`🇨🇦`,`🇨🇷`,`🇨🇺`,`🇩🇴`,`🇬🇵`,`🇬🇹`,`🇲🇶`,`🇲🇽`,`🇳🇮`,`🇵🇦`,`🇰🇳`,`🇻🇨`,`🇺🇸`,`🇦🇷`,`🇧🇴`,`🇧🇷`,`🇨🇱`,`🇨🇴`,`🇵🇾`,`🇵🇪`,`🇺🇾`,`🇦🇺`,`🇿🇦`],
      lived: [`🇧🇷`, `🇵🇹`, `🇩🇪`, `🇬🇧`, `🇨🇦`, `🇩🇰`],
    },
    description: `A blog about engineering, leadership, venture building and culture.`,
    siteDescription: `A blog about engineering, leadership, venture building and culture.`,
    siteUrl: `https://felipeschmitt.com/`,
    social: [
      {
        name: `twitter`,
        url: `https://twitter.com/schmittfelipe`,
      },
      {
        name: `github`,
        url: `https://github.com/fsschmitt`,
      },
      {
        name: `linkedin`,
        url: `https://www.linkedin.com/in/felipeschmitt/`,
      },
      {
        name: `500px`,
        url: `https://500px.com/fsschmitt`,
      },
      {
        name: `about`,
        url: `/initial-commit`,
      },
    ],
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1600,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-165314019-1`,
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.nodes.map(node => {
                return Object.assign({}, node.frontmatter, {
                  description: node.excerpt,
                  date: node.frontmatter.date,
                  url: site.siteMetadata.siteUrl + node.fields.slug,
                  guid: site.siteMetadata.siteUrl + node.fields.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                })
              })
            },
            query: `
              {
                allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
                  nodes {
                    excerpt
                    html
                    fields {
                      slug
                    }
                    frontmatter {
                      title
                      date
                    }
                  }
                }
              }
            `,
            output: "/rss.xml",
            title: "Engineering processes applied to our daily life RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Engineering processes applied to our daily life`,
        short_name: `Engineering life`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `content/assets/favicon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-plugin-sitemap`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    `gatsby-plugin-offline`,
  ],
}
