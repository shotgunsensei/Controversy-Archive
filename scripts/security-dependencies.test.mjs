import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const mobileRequire = createRequire(
  new URL("../artifacts/mobile/package.json", import.meta.url),
);
const reactNativeRequire = createRequire(
  mobileRequire.resolve("react-native/package.json"),
);
const consumers = {
  Expo: mobileRequire.resolve("expo/metro-config"),
  "React Native": reactNativeRequire.resolve(
    "@react-native/community-cli-plugin/package.json",
  ),
};

// Both Metro trees must keep accepting file-based assets after upgrading the
// vulnerable image-size 1 dependency to image-size 2 (which accepts bytes only).
for (const [name, consumer] of Object.entries(consumers)) {
  const consumerRequire = createRequire(consumer);
  const metroDir = path.dirname(consumerRequire.resolve("metro/package.json"));
  const { getAssetData, getAssetSize } = consumerRequire(
    path.join(metroDir, "src/Assets.js"),
  );

  test(`${name}: patched Metro loads image and non-image assets`, async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "security-assets-"));
    try {
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pX8AAAAASUVORK5CYII=",
        "base64",
      );
      await writeFile(path.join(dir, "pixel.png"), png);
      await writeFile(path.join(dir, "sample.txt"), "non-image asset");
      assert.deepEqual(getAssetSize("png", png, "pixel.png"), {
        width: 1,
        height: 1,
      });
      const image = await getAssetData(
        path.join(dir, "pixel.png"), "pixel.png", [], null, "/assets",
      );
      assert.equal(image.width, 1);
      assert.equal(image.height, 1);
      const other = await getAssetData(
        path.join(dir, "sample.txt"), "sample.txt", [], null, "/assets",
      );
      assert.equal(other.width, undefined);
      assert.equal(other.height, undefined);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}
