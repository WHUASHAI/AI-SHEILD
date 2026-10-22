import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {load} from './history-loader.mjs';
const require=createRequire(import.meta.url);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
test('saved reports disclose failed optional checks instead of displaying a zero verdict',()=>{
  let stateIndex=0;
  const scan={id:'saved',name:'Image analysis',module:'image',date:'2026-10-22T00:00:00Z',result:'Likely Human-Created',confidence:90,
    snapshot:{providerWarning:'The deepfake check was unavailable.',deepfakeAnalyzed:false,breakdown:{aiGenerated:10,deepfakeScore:0,facesDetected:0}}};
  const page=load('src/app/(dashboard)/dashboard/scans/[id]/page.tsx',{
    'react':{useEffect(){},useState:initial=>{const index=stateIndex++;return [index===0?scan:index===2?false:initial,()=>{}];}},
    'react/jsx-runtime':require('react/jsx-runtime'),
    'next/navigation':{useParams:()=>({id:'saved'}),useRouter:()=>({push(){}})},
    'next/link':{default:({children,href})=>React.createElement('a',{href},children)},
    '@/components/detection/disclaimer-banner':{DisclaimerBanner:()=>null},
  });
  const html=renderToStaticMarkup(React.createElement(page.default));
  assert.match(html,/The deepfake check was unavailable/);
  assert.match(html,/Not checked/);
});
