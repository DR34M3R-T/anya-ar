# SPY x FAMILY CODE: WHITE WebAR tokuten reimplementation  

The [original WebAR app](https://codewhite-movie-ar-cn.spy-family.net/) of the movie tokuten is constructed using 8thWall, which is a commercial WebAR service provider. That's why the website of this tokuten last only till 30th Jun. So I try to dump the website and reimplement it using open source framework. Finally, I choose [MindAR](https://github.com/hiukim/mind-ar-js).  

### Demo: [here](https://dr34m3r-t.github.io/anya-ar/).  
You can download the picture of the double-sided tokuten cardboard [here](https://github.com/DR34M3R-T/anya-ar/tree/main/cardboard) to enjoy the WebAR app.  
Please launch it on portrait mobile device to have better WebAR experience.  

As a result of MindAR's bug([#93](https://github.com/hiukim/mind-ar-js/issues/93)), particle effect cannot be set together with the loaded model. So [here](https://dr34m3r-t.github.io/anya-ar/model-view/) I prepare a simple AFRAME model viewer which can correctly show the fireworks' particle animation when Anya stand still.