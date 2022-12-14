const { titleCase } = require('title-case');

// This regex finds all wikilinks in a string
const wikilinkRegExp = /\[\[\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/g;

function caselessCompare(a, b) {
  return a.normalize().toLowerCase() === b.normalize().toLowerCase();
}

module.exports = {
  layout: 'garden.html',
  type: 'garden',
  eleventyComputed: {
    title: (data) => data.title || titleCase(data.page.fileSlug),
    backlinks: (data) => {
      const notes = data.collections.garden;
      const currentFileSlug = data.page.filePathStem.replace('/garden/', '');

      let backlinks = [];

      // Search the other notes for backlinks
      for (const otherNote of notes) {
        const noteContent = otherNote.template.frontMatter.content;

        // Get all links from otherNote
        const outboundLinks = (noteContent.match(wikilinkRegExp) || []).map(
          (link) =>
            // Extract link location
            link
              .slice(2, -2)
              .split('|')[0]
              .replace(/.(md|markdown)\s?$/i, '')
              .trim()
        );

        // If the other note links here, return related info
        const hasLink = outboundLinks.some((link) =>
          caselessCompare(link, currentFileSlug)
        );
        // If the other note is the index page of a collection the note
        // is in, add it.
        const inCollection =
          data.tags &&
          data.tags.some((tag) => `/garden/${tag}/` === otherNote.url);
        if (hasLink || inCollection) {
          // Construct preview for hovercards
          let preview = noteContent.slice(0, 240);

          backlinks.push({
            url: otherNote.url,
            title: otherNote.data.title,
            preview,
          });
        }
      }

      return backlinks;
    },
  },
};
