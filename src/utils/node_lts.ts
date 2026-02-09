import getNodeLTS from 'node-lts-versions'

export async function getLatestActiveLTSVersion() {
  await getNodeLTS.fetchLTS()
  const ltsNodeVersion = JSON.parse(getNodeLTS.json('active'))[0]
  return getNodeLTS.majorsLatest[ltsNodeVersion].version
}
