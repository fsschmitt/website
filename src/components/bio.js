/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
            lived
          }
          siteDescription
          social {
            name
            url
          }
        }
      }
    }
  `)

  const { author, siteDescription, social } = data.site.siteMetadata
  return (
    <div
      style={{
        marginBottom: rhythm(2.5),
      }}
    >
      <div
        style={{
          display: `flex`,
          flexWrap: `wrap`,
        }}
      >
        <Image
          fixed={data.avatar.childImageSharp.fixed}
          alt={author.name}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            minWidth: 50,
            borderRadius: `100%`,
            width: 56,
            height: 56,
          }}
          imgStyle={{
            borderRadius: `50%`,
          }}
        />
        <div
          style={{
            margin: 0,
          }}
        >
          <div
            style={{
              fontSize: rhythm(0.8),
              lineHeight: `28px`,
              margin: "0",
            }}
          >
            Written by {author.name}
          </div>
          {siteDescription}
          <div
            style={{
              flexBasis: `100%`,
              height: 0,
            }}
          />
          <div>
            {social.map(social => (
              <a
                key={social.name}
                href={social.url}
                style={{
                  marginRight: `${rhythm(0.3)}`,
                }}
              >
                {social.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bio
