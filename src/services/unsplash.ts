export interface UnsplashPhoto {
  id: string;
  /** Object URL for the downloaded image blob — caller is responsible for revoking it. */
  blobUrl: string;
  width: number;
  height: number;
  photographerName: string;
  photographerProfileUrl: string;
  photoLinkUrl: string;
}

interface UnsplashApiPhoto {
  id: string;
  width: number;
  height: number;
  urls: { regular: string };
  user: { name: string; links: { html: string } };
  links: { html: string; download_location: string };
}

export async function fetchRandomUnsplashPhoto(accessKey: string, topic: string): Promise<UnsplashPhoto> {
  const metaUrl = new URL('https://api.unsplash.com/photos/random');
  metaUrl.searchParams.set('query', topic);
  metaUrl.searchParams.set('orientation', 'landscape');

  const metaResponse = await fetch(metaUrl.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  if (!metaResponse.ok) throw new Error(`Unsplash request failed: ${metaResponse.status}`);
  const meta = (await metaResponse.json()) as UnsplashApiPhoto;

  const imageResponse = await fetch(meta.urls.regular);
  if (!imageResponse.ok) throw new Error('Failed to download the Unsplash image');
  const blob = await imageResponse.blob();

  // Required by Unsplash API guidelines whenever a photo is displayed to a user.
  void fetch(`${meta.links.download_location}&client_id=${accessKey}`).catch(() => {});

  return {
    id: meta.id,
    blobUrl: URL.createObjectURL(blob),
    width: meta.width,
    height: meta.height,
    photographerName: meta.user.name,
    photographerProfileUrl: `${meta.user.links.html}?utm_source=dayboard&utm_medium=referral`,
    photoLinkUrl: `${meta.links.html}?utm_source=dayboard&utm_medium=referral`,
  };
}
