# [1.0.0-next.6](https://github.com/jeziellopes/trading-engine/compare/v1.0.0-next.5...v1.0.0-next.6) (2026-04-01)


### Bug Fixes

* **ci:** remove invalid biome --check flag from code-quality workflow ([5755ea4](https://github.com/jeziellopes/trading-engine/commit/5755ea45cce165ddb29d9f16132271b05f5f480b))


### Features

* **ui:** add Select, Label, Textarea primitives; wire Button/Input in bot forms ([d53c7be](https://github.com/jeziellopes/trading-engine/commit/d53c7be248a340ea9ba6f4108f6472ab35ee6ca3))

# [1.0.0-next.5](https://github.com/jeziellopes/trading-engine/compare/v1.0.0-next.4...v1.0.0-next.5) (2026-04-01)


### Bug Fixes

* **design-system:** correct Flowa theme — forest primary, full 3-colour palette, DS page visibility ([243737c](https://github.com/jeziellopes/trading-engine/commit/243737cfd301c877f8431c740543514ec988e2ac)), closes [#12](https://github.com/jeziellopes/trading-engine/issues/12) [#25352D](https://github.com/jeziellopes/trading-engine/issues/25352D) [#c2e189](https://github.com/jeziellopes/trading-engine/issues/c2e189) [#9354BB](https://github.com/jeziellopes/trading-engine/issues/9354BB)

# [1.0.0-next.4](https://github.com/jeziellopes/trading-engine/compare/v1.0.0-next.3...v1.0.0-next.4) (2026-04-01)


### Features

* **design-system:** close [@theme](https://github.com/theme) gaps and standardise token usage ([b2b0bd0](https://github.com/jeziellopes/trading-engine/commit/b2b0bd02641480c6c8de407b587b4cdafbb7d11e)), closes [#13](https://github.com/jeziellopes/trading-engine/issues/13)

# [1.0.0-next.3](https://github.com/jeziellopes/trading-engine/compare/v1.0.0-next.2...v1.0.0-next.3) (2026-04-01)


### Bug Fixes

* **perf:** remove unused MOCK_CANDLE_* imports from trading layout ([2d126d8](https://github.com/jeziellopes/trading-engine/commit/2d126d835f8adc93b4012dc851fd119f9633670f))
* **test:** replace undefined mockState with MOCK_ORDER_BOOK_STATE in order-book tests ([66315d4](https://github.com/jeziellopes/trading-engine/commit/66315d4cd626c100ba8aa561eff74627080898b9))


### Performance Improvements

* **bundle:** lazy-load recharts and react-grid-layout ([9d845ba](https://github.com/jeziellopes/trading-engine/commit/9d845baf5a81e042bdce25b93c596f7cb1779bf3)), closes [#20](https://github.com/jeziellopes/trading-engine/issues/20)

# [1.0.0-next.2](https://github.com/jeziellopes/trading-engine/compare/v1.0.0-next.1...v1.0.0-next.2) (2026-04-01)


### Bug Fixes

* **layout:** swap order-entry and portfolio panel positions ([6a81be8](https://github.com/jeziellopes/trading-engine/commit/6a81be8b89bdf7195b9d8e991a76ef3a53e59bd3)), closes [#9](https://github.com/jeziellopes/trading-engine/issues/9)

# 1.0.0-next.1 (2026-04-01)


### Bug Fixes

* **a11y:** add aria-labels to icon buttons, wire input labels, add route titles ([b46b019](https://github.com/jeziellopes/trading-engine/commit/b46b019d360496814862fbf78186e1c3ee5a9bf7)), closes [#19](https://github.com/jeziellopes/trading-engine/issues/19)
* **bots:** back link navigates to /symbol/$symbol not landing page ([d4b96ac](https://github.com/jeziellopes/trading-engine/commit/d4b96accc55b0c7e0c152f218ed840b5674eaae2))
* **bots:** replace emoji symbols with lucide-react icons ([e2f6bd7](https://github.com/jeziellopes/trading-engine/commit/e2f6bd7761255b09d5446aeb97ac525391c98f8d))
* **chart:** resolve oklch CSS vars to rgb before passing to lightweight-charts ([712fe38](https://github.com/jeziellopes/trading-engine/commit/712fe38d739fa18c1f4b4533457ed552854ec2ea)), closes [#40](https://github.com/jeziellopes/trading-engine/issues/40)
* **ds:** night-city light primary contrast + soft button swatch ([3864db3](https://github.com/jeziellopes/trading-engine/commit/3864db3be3ebbf4325d55508bf22cbcb50a69599))
* **ds:** persist theme+mode to localStorage, default to night-city dark ([b35ccad](https://github.com/jeziellopes/trading-engine/commit/b35ccad63d4036bdd49febfd148fd8407a89c3e7))
* **ds:** persist theme+mode to localStorage, default to night-city dark ([399dd6c](https://github.com/jeziellopes/trading-engine/commit/399dd6c5b08e9cbe5fd0729060f178fd387ded4b))
* **ds:** replace --t-primary with --primary in all components ([f05117b](https://github.com/jeziellopes/trading-engine/commit/f05117b014721c10807eba916d1e77dfb1f994e2))
* **order-entry:** address review findings from PR [#25](https://github.com/jeziellopes/trading-engine/issues/25) ([c7765f0](https://github.com/jeziellopes/trading-engine/commit/c7765f0634f1b81862ebf0fc0092e40b8ad5a1d4))
* **root:** move Toaster inside root div — fixes JSX parent element error ([ff116d6](https://github.com/jeziellopes/trading-engine/commit/ff116d64e8e70ccc5b8dc2978390aa469a3e3111))
* **routes:** correct link text from 'TRADETERM' to 'Trading Engine' ([9ea6a59](https://github.com/jeziellopes/trading-engine/commit/9ea6a590ec2be8a2839c44f3d73552b6e9de4602))
* **terminal:** always render price input, disable on market orders ([e8ce6dc](https://github.com/jeziellopes/trading-engine/commit/e8ce6dc4e22fb85cb457a62b885236986ecef2c2))
* **terminal:** chart height, portfolio summary panel, layout proportions ([0a5d1dd](https://github.com/jeziellopes/trading-engine/commit/0a5d1dd28f832744030efad21a92f31f1a4086f0))
* **terminal:** wire $symbol route to TradingLayout ([7bd4cfd](https://github.com/jeziellopes/trading-engine/commit/7bd4cfdde47a759ee200bd05d6d521a3ec6929a6))
* **ui:** add ErrorBoundary component and wrap routes and feature panels ([2c52f84](https://github.com/jeziellopes/trading-engine/commit/2c52f84d41716cb3be92d3ae15c856e432f0ef28)), closes [#18](https://github.com/jeziellopes/trading-engine/issues/18)
* **ui:** reduce button font-weight for better dark theme readability ([4d9e7ef](https://github.com/jeziellopes/trading-engine/commit/4d9e7ef558e5aeb6c86722a01f17a527122909fb)), closes [#11](https://github.com/jeziellopes/trading-engine/issues/11)
* **ui:** review pass — blockers + warnings before data layer ([871b5ef](https://github.com/jeziellopes/trading-engine/commit/871b5ef735fa6bd27f9382bf12a124def9627ec9))


### Features

* **bots:** add bot configuration form with RHF + Zod validation ([b41f525](https://github.com/jeziellopes/trading-engine/commit/b41f525893b5ff52bab950a3ece3919eb4b5542f)), closes [#3](https://github.com/jeziellopes/trading-engine/issues/3)
* **bots:** full-screen detail route with trades, edit settings ([bed7d99](https://github.com/jeziellopes/trading-engine/commit/bed7d9988423713eb7fe6cbb0e5d720ae476d9cf))
* **chart:** replace div-based chart with lightweight-charts candlestick series ([6d7090f](https://github.com/jeziellopes/trading-engine/commit/6d7090f2ab9dfd66a334395ee86da5f4473c51bb)), closes [#8](https://github.com/jeziellopes/trading-engine/issues/8)
* **design-system:** gallery route with theme switcher and contrast audit ([60195db](https://github.com/jeziellopes/trading-engine/commit/60195db9668138815870c941f66e3473aaa807f8))
* **docs:** add README and ROADMAP for project overview ([4ad2977](https://github.com/jeziellopes/trading-engine/commit/4ad29775292284e9e9fe344c79ad139781e8eb8d))
* **favicon:** add favicon.svg file [skip ci] ([a72bc9d](https://github.com/jeziellopes/trading-engine/commit/a72bc9d32d743786898105cd8b68db16d923004b))
* **landing:** add cyberpunk landing page at / ([aa7c643](https://github.com/jeziellopes/trading-engine/commit/aa7c643388b27916a3b4f50afc4557c8e51b57f8))
* **nav:** theme selector dropdown replaces DS button ([a4f1b92](https://github.com/jeziellopes/trading-engine/commit/a4f1b92e135429ef59d62b39bcbc83b076c1033d)), closes [#6](https://github.com/jeziellopes/trading-engine/issues/6)
* **order-book:** implement bid and ask tables with tests ([b7bfe4c](https://github.com/jeziellopes/trading-engine/commit/b7bfe4ceb5dfd1eb371eb334ed1c4352cbcfda11))
* **order-book:** split asks/bids into independent scrollable containers ([4518bb5](https://github.com/jeziellopes/trading-engine/commit/4518bb51d0b4b99cd4410ed2b13b3b0d82562123)), closes [#10](https://github.com/jeziellopes/trading-engine/issues/10)
* **order-entry:** wire RHF + Zod validation and add sonner toast notifications ([7add4a1](https://github.com/jeziellopes/trading-engine/commit/7add4a1d9490b717177b88ca5fc101ecbe44e622)), closes [#16](https://github.com/jeziellopes/trading-engine/issues/16) [#17](https://github.com/jeziellopes/trading-engine/issues/17)
* **order-form:** implement order form with validation and inputs ([2b5b3c7](https://github.com/jeziellopes/trading-engine/commit/2b5b3c71a603d1c2a6f21104f143f8b620977f0e))
* **portfolio:** implement balance display and position card components with tests ([bd7a27f](https://github.com/jeziellopes/trading-engine/commit/bd7a27f35da2d78944665c8efa7ce315f5935ccf))
* **portfolio:** nav preview + full portfolio route ([7f74306](https://github.com/jeziellopes/trading-engine/commit/7f74306ead2f64b2363dadcfc9c2f789d847b40d))
* **router:** implement router setup and create root route ([6ba46a8](https://github.com/jeziellopes/trading-engine/commit/6ba46a871625f6c02972a0002e1752cca5057384))
* **routes:** implement root NavBar and portfolio page ([a29cbc1](https://github.com/jeziellopes/trading-engine/commit/a29cbc13a5fa1ae65827ed14599460fa8337e26d))
* **shell:** add persistent nav bar to root layout ([6a7b6c3](https://github.com/jeziellopes/trading-engine/commit/6a7b6c302f3cf54d0bb773c95c7128802ab4b6a3))
* **styles:** add design tokens and update app styles ([35793c3](https://github.com/jeziellopes/trading-engine/commit/35793c34134e7fb16410547452ae7c4e9c589d7a))
* **symbol:** add trading layout with order book and portfolio ([70e78cd](https://github.com/jeziellopes/trading-engine/commit/70e78cdb1fd1fa50c4409b15c9218320005ab83c))
* **terminal:** bot manager panel with run/pause/stop controls ([e260e4f](https://github.com/jeziellopes/trading-engine/commit/e260e4fd214b25af71bac47e678cbe4f5fe76646)), closes [#2](https://github.com/jeziellopes/trading-engine/issues/2)
* **terminal:** fix dynamic route and add mock broker UI ([b6ea15e](https://github.com/jeziellopes/trading-engine/commit/b6ea15eb7e4f9f59404ce673c3ef9f1d94d0d36d))
* **terminal:** full-screen layout, draggable panels, trades table ([a3aa4c4](https://github.com/jeziellopes/trading-engine/commit/a3aa4c40d03ca7bcb79b9a33abb6fd9699689fc2))
* **terminal:** symbol selector, order book direction, focus-visible outline ([0a11958](https://github.com/jeziellopes/trading-engine/commit/0a11958314bc7ae1b9fb819130e2a20e9f0b36d4))
* **terminal:** trade P&L columns, xs/sm controls, ticker open + strategy spec ([7e65bd6](https://github.com/jeziellopes/trading-engine/commit/7e65bd6e0250f61fc94b8cec243c8e35f4988e37))
* **theme:** add Flowa theme with dark/light/vibrant modes ([ab1b65b](https://github.com/jeziellopes/trading-engine/commit/ab1b65beaa700212ab027adad38d1dc6410f1fca)), closes [#5F2BFF](https://github.com/jeziellopes/trading-engine/issues/5F2BFF) [#c2e189](https://github.com/jeziellopes/trading-engine/issues/c2e189) [#12](https://github.com/jeziellopes/trading-engine/issues/12)
* **tokens:** add WCAG contrast lib, CSS token parser, and audit script ([cb29a6c](https://github.com/jeziellopes/trading-engine/commit/cb29a6c4f03f663ddcf86f26d3ae2a3934f1652d))
* **tokens:** implement three-layer theme architecture ([d7b436c](https://github.com/jeziellopes/trading-engine/commit/d7b436c0713963c952e4d555938446eabcfb2a20))
* **ui:** add badge, button, card, depth bar, and input components with tests ([34cd787](https://github.com/jeziellopes/trading-engine/commit/34cd787440eab62e6131c2c351916b4fcfb3802d))
