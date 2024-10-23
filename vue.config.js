const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
});

module.exports = {
  devServer: {
    proxy: {
      "/sm": {
        target: "https://www.safemap.go.kr",
        changeOrigin: true,
        secure: false, // HTTPS 서버라도 보안 검사를 생략합니다.
        pathRewrite: { "^/sm": "" },
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    },
  },
};
