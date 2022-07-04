exports.createPages = async ({ actions }) => {
  const { createPage } = actions
  createPage({
    path: "/using-dsg",
    component: require.resolve("./src/templates/using-dsg.js"),
    context: {},
    defer: true,
  })
}
// Thanks to https://github.com/gatsbyjs/gatsby/issues/17661#issuecomment-665800908
exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  // if (stage === "build-html") {
      actions.setWebpackConfig({
          externals: ['canvas']
      })
  // }
};