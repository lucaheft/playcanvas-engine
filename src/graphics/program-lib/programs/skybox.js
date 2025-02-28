import { SEMANTIC_POSITION } from '../../constants.js';
import { shaderChunks } from '../chunks/chunks.js';

import { gammaCode, precisionCode, tonemapCode } from './common.js';

const skybox = {
    generateKey: function (options) {
        return options.type === 'cubemap' ?
            `skybox-${options.type}-${options.rgbm}-${options.hdr}-${options.fixSeams}-${options.toneMapping}-${options.gamma}-${options.useIntensity}-${options.mip}` :
            `skybox-${options.type}-${options.encoding}-${options.useIntensity}-${options.gamma}-${options.toneMapping}`;
    },

    createShaderDefinition: function (device, options) {

        let fshader;
        if (options.type === 'cubemap') {
            const mip2size = [128, 64, /* 32 */ 16, 8, 4, 2];

            fshader = precisionCode(device);
            fshader += options.mip ? shaderChunks.fixCubemapSeamsStretchPS : shaderChunks.fixCubemapSeamsNonePS;
            fshader += options.useIntensity ? shaderChunks.envMultiplyPS : shaderChunks.envConstPS;
            fshader += gammaCode(options.gamma);
            fshader += tonemapCode(options.toneMapping);
            fshader += shaderChunks.decodePS;
            fshader += shaderChunks.rgbmPS;
            fshader += shaderChunks.skyboxHDRPS
                .replace(/\$textureCubeSAMPLE/g, options.rgbm ? "textureCubeRGBM" : (options.hdr ? "textureCube" : "textureCubeSRGB"))
                .replace(/\$FIXCONST/g, (1 - 1 / mip2size[options.mip]) + "");
        } else {
            const decodeTable = {
                'rgbm': 'decodeRGBM',
                'rgbe': 'decodeRGBE',
                'linear': 'decodeLinear'
            };

            fshader = precisionCode(device);
            fshader += options.useIntensity ? shaderChunks.envMultiplyPS : shaderChunks.envConstPS;
            fshader += gammaCode(options.gamma);
            fshader += tonemapCode(options.toneMapping);
            fshader += shaderChunks.decodePS;
            fshader += shaderChunks.skyboxEnvPS.replace(/\$DECODE/g, decodeTable[options.encoding] || "decodeGamma");
        }

        return {
            attributes: {
                aPosition: SEMANTIC_POSITION
            },
            vshader: shaderChunks.skyboxVS,
            fshader: fshader
        };
    }
};

export { skybox };
