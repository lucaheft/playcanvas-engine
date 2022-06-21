import * as pc from '../../../../';

class MaterialBasicExample {
    static CATEGORY = 'Graphics';
    static NAME = 'Material Basic';

    example(canvas: HTMLCanvasElement): void {

        // Create the application and start the update loop
        const app = new pc.Application(canvas, {});

        const assets = {
            'font': new pc.Asset('font', 'font', { url: '/static/assets/fonts/arial.json' }),
            'rocks': new pc.Asset("rocks", "texture", { url: "/static/assets/textures/seaside-rocks01-diffuse-alpha.png" })
        };

        const assetListLoader = new pc.AssetListLoader(Object.values(assets), app.assets);
        assetListLoader.load(() => {
            app.start();

            // Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
            app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            // Create an entity with a camera component
            const camera = new pc.Entity();
            camera.addComponent("camera", {
                clearColor: new pc.Color(0.1, 0.1, 0.1, 1)
            });
            camera.translate(2, 1, 8);
            camera.lookAt(new pc.Vec3(0, -0.3, 0));
            app.root.addChild(camera);

            const NUM_BOXES = 5;

            // alpha blend modes for individual rows
            const blendModes = [
                pc.BLEND_ADDITIVE,
                pc.BLEND_SUBTRACTIVE,
                pc.BLEND_SCREEN,
                pc.BLEND_NORMAL,
                pc.BLEND_NONE
            ];

            const createPrimitive = function (x: number, y: number, z: number) : pc.Entity {

                // a basic material, which does not have support for lighting
                const material = new pc.BasicMaterial();

                // diffuse color
                material.color.set(x, y, 1 - y);

                // diffuse texture with alpha channel for transparency
                material.colorMap = assets.rocks.resource;

                // disable culling to see back faces as well
                material.cull = pc.CULLFACE_NONE;

                // set up alpha test value
                material.alphaTest = x / NUM_BOXES - 0.1;

                // alpha blend mode
                material.blendType = blendModes[y];

                const box = new pc.Entity();
                box.addComponent("render", {
                    material: material,
                    type: "box",

                    // Note: basic material cannot currently cast shadows, disable it
                    castShadows: false
                });
                box.setLocalPosition(x - (NUM_BOXES - 1) * 0.5, y - (NUM_BOXES - 1) * 0.5, z);
                box.setLocalScale(0.7, 0.7, 0.7);
                app.root.addChild(box);

                return box;
            };

            const boxes: Array<pc.Entity> = [];
            for (let i = 0; i < NUM_BOXES; i++) {
                for (let j = 0; j < NUM_BOXES; j++) {
                    boxes.push(createPrimitive(j, i, 0));
                }
            }

            const createText = function (fontAsset: pc.Asset, message: string, x: number, y: number, z: number, rot: number) {
                // Create a text element-based entity
                const text = new pc.Entity();
                text.addComponent("element", {
                    anchor: [0.5, 0.5, 0.5, 0.5],
                    fontAsset: fontAsset,
                    fontSize: 0.5,
                    pivot: [0.5, 0.5],
                    text: message,
                    type: pc.ELEMENTTYPE_TEXT
                });
                text.setLocalPosition(x, y, z);
                text.setLocalEulerAngles(0, 0, rot);
                app.root.addChild(text);
            };

            createText(assets.font, 'Alpha Test', 0, -(NUM_BOXES + 1) * 0.5, 0, 0);
            createText(assets.font, 'Alpha Blend', -(NUM_BOXES + 1) * 0.5, 0, 0, 90);

            // Set an update function on the app's update event
            let time = 0;
            const rot = new pc.Quat();
            app.on("update", function (dt: number) {
                time += dt;

                // rotate the boxes
                rot.setFromEulerAngles(20 * time, 30 * time, 0);
                boxes.forEach((box) => {
                    box.setRotation(rot);
                });
            });
        });
    }
}

export default MaterialBasicExample;
