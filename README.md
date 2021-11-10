![Last modified][last-commit]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

[![Stack Overflow][stack-shield]](https://stackoverflow.com/tags/kentico-kontent)
[![GitHub Discussions][discussion-shield]](https://github.com/Kentico/Home/discussions)

<p align="center">
<image src="docs/kontent.webp" alt="kontent logo" width="150" />
</p>

## Description

This custom element for [Kentico Kontent](https://kontent.ai) can be used for deep `copy from language` feature. This means it will copy from language current item & all its linked items recursively.

## Quick Deploy

Netlify has made this easy. If you click the deploy button below, it will guide you through the process of deploying it to Netlify and leave you with a copy of the repository in your account as well.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Enngage/kontent-custom-element-language-copy)

## Configuration

You will need to add the custom element to a content type filling in the hosted code URL and the following JSON parameters:

```json
{
   // required
    "projectId": "<YOUR PROJECT ID>",
    "apiKEy": "<YOUR MANAGEMENT API KEY>",
    // optional
    "overwriteExistingVariants": true | false,
}
```

## Demo

![Demo Animation][product-demo]

## What is Saved

This custom element does not save any value

## Development

This custom element is built with `Angular`. See package.json for scripts regarding building & publishing the library.

## Contributors

We have collected notes on how to contribute to this project in [CONTRIBUTING.md](CONTRIBUTING.md).

Originally created by [@Enngage](https://github.com/Enngage)

<a href="https://github.com/Enngage/kontent-custom-element-language-copy/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Enngage/kontent-custom-element-language-copy" />
</a>

## License

[MIT](https://tldrlegal.com/license/mit-license)

## Additional Resources

-   [Custom Element Gallery on github](https://kentico.github.io/kontent-custom-element-samples/gallery/)
-   [Kentico Kontent's Integration documentation](https://docs.kontent.ai/tutorials/develop-apps/integrate/integrations-overview)
-   [Custom Element documentation](https://docs.kontent.ai/tutorials/develop-apps/integrate/content-editing-extensions)
-   [Custom Element API reference](https://docs.kontent.ai/reference/custom-elements-js-api)

[last-commit]: https://img.shields.io/github/last-commit/Enngage/kontent-custom-element-wistia?style=for-the-badge
[contributors-shield]: https://img.shields.io/github/contributors/Enngage/kontent-custom-element-wistia.svg?style=for-the-badge
[contributors-url]: https://github.com/Enngage/kontent-custom-element-language-copy/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Enngage/kontent-custom-element-wistia.svg?style=for-the-badge
[forks-url]: https://github.com/Enngage/kontent-custom-element-language-copy/network/members
[stars-shield]: https://img.shields.io/github/stars/Enngage/kontent-custom-element-wistia.svg?style=for-the-badge
[stars-url]: https://github.com/Enngage/kontent-custom-element-language-copy/stargazers
[issues-shield]: https://img.shields.io/github/issues/Enngage/kontent-custom-element-wistia.svg?style=for-the-badge
[issues-url]: https://github.com/Enngage/kontent-custom-element-language-copy/issues
[license-shield]: https://img.shields.io/github/license/Enngage/kontent-custom-element-wistia.svg?style=for-the-badge
[license-url]: https://github.com/Enngage/kontent-custom-element-language-copy/blob/master/LICENSE
[core-shield]: https://img.shields.io/static/v1?label=&message=core%20integration&style=for-the-badge&color=FF5733
[gallery-shield]: https://img.shields.io/static/v1?label=&message=extension%20gallery&style=for-the-badge&color=51bce0
[stack-shield]: https://img.shields.io/badge/Stack%20Overflow-ASK%20NOW-FE7A16.svg?logo=stackoverflow&logoColor=white&style=for-the-badge
[discussion-shield]: https://img.shields.io/badge/GitHub-Discussions-FE7A16.svg?logo=github&style=for-the-badge
[product-demo]: docs/demo.gif?raw=true
