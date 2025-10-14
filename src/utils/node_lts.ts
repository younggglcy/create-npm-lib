// @ts-expect-error ignore it temporarily, will be fixed in new version
import getNodeLTS from 'node-lts-versions'

export async function getLatestActiveLTSVersion() {
  await getNodeLTS.fetchLTS()
  const ltsNodeVersion = JSON.parse(getNodeLTS.json('active'))[0]
  return getNodeLTS.majorsLatest[ltsNodeVersion].version
}
