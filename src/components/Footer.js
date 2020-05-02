import React from "react"
import { rhythm } from "../utils/typography"
import { StaticQuery } from "gatsby"

class Footer extends React.Component {
  render() {
    return (
      <div style={{
        marginTop: rhythm(2.5),
        paddingTop: rhythm(1),
        textAlign: 'center',
      }}>
        <StaticQuery
          query={graphql`
            query {
              site {
                siteMetadata {
                  author {
                    name
                    summary
                    visit
                    lived
                  }
                }
              }
            }
          `}
        render={data =>
          <React.Fragment>
            <div>
              <em style={{
              fontSize: rhythm(0.5),
              }}>{data.site.siteMetadata.author.summary}</em>
            </div>
            </React.Fragment>
          }
        />
        </div>
    )
  }
}

export default Footer