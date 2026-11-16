import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import NextImage from 'next/image.js';
import { loadTs } from './load-ts.mjs';

const Image = NextImage.default ?? NextImage;
const filePath = 'uploads/0123456789abcdef0123456789abcdef.png';
const transport = { publicApiResponse: async () => Response.json({ isSuccess: true, data: [{
  id: 1, isActive: true, image: { id: 9, filePath },
}], error: null }) };

test('internal upload URLs and SSR optimization stay same-origin across development and production builds', async () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL };
  try {
    for (const [mode, origin] of [
      ['development', 'http://localhost:3000'],
      ['production', 'http://localhost:3000'], // Reproduce an artifact built with the wrong origin.
      ['production', 'http://lapis-staging.runasp.net'],
      ['production', 'https://example.invalid'],
      ['production', undefined],
    ]) {
      process.env.NODE_ENV = mode;
      if (origin === undefined) delete process.env.NEXT_PUBLIC_API_BASE_URL;
      else process.env.NEXT_PUBLIC_API_BASE_URL = origin;
      const client = loadTs('lib/api/client.ts', { '@/server/integration/public-transport': transport });
      for (const extension of ['jpg', 'png', 'webp', 'gif', 'pdf']) {
        const path = filePath.replace(/png$/, extension);
        assert.equal(client.createAssetUrl(path), '/' + path);
        assert.equal(client.createAssetUrl('/' + path), '/' + path);
      }
      assert.equal(client.createAssetUrl(null), null);
      assert.equal(client.createAssetUrl(undefined), null);
      assert.equal(client.createAssetUrl(''), null);
      for (const external of ['https://cdn.example.invalid/photo.png', 'http://images.example.invalid/uploads/external.png']) {
        assert.equal(client.createAssetUrl(external), external);
      }
      const specialists = loadTs('lib/api/specialists.ts', { './client': client });
      const result = await specialists.getSpecialists();
      assert.equal(result.data[0].image.filePath, filePath); // Preserve the API DTO.
      assert.equal(result.data[0].imageUrl, '/' + filePath);
      const markup = renderToStaticMarkup(React.createElement(Image, {
        src: result.data[0].imageUrl, alt: 'Specialist', width: 305, height: 340,
      }));
      assert.match(markup, /\/_next\/image\?url=%2Fuploads%2F/);
      assert.doesNotMatch(markup, /localhost|lapis-staging|example\.invalid/);
    }
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
