import { NextRequest, NextResponse } from 'next/server';
import { requireSessionResponse } from '@/lib/require-session';
import { z } from 'zod';
import { withScanHistory } from '@/lib/with-scan-history';
import { ProviderError, readProviderJson } from '@/lib/provider-error';
import { providerFailure } from '@/lib/provider-response';

export const runtime='nodejs';
export const maxDuration=60;
const TextScanSchema=z.object({text:z.string().min(10).max(50000)});
type Classification={label:string;score:number};
async function analyze(req:NextRequest) {
  const unauthorized=await requireSessionResponse();if(unauthorized)return unauthorized;
  try {
    const validated=TextScanSchema.safeParse(await req.json());
    if(!validated.success)return NextResponse.json({error:'Enter between 10 and 50,000 characters.'},{status:400});
    const key=process.env.HUGGINGFACE_API_KEY;
    if(!key)throw new ProviderError('Text detection is not configured. The website owner needs to configure its provider.',503,'PROVIDER_CONFIGURATION_ERROR');
    const {text}=validated.data;
    const response=await fetch('https://router.huggingface.co/hf-inference/models/openai-community/roberta-base-openai-detector',{
      method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
      body:JSON.stringify({inputs:text.slice(0,2000)}),
    });
    const payload=await readProviderJson<unknown>(response,'Hugging Face');
    const candidates=Array.isArray(payload)&&Array.isArray(payload[0])?payload[0]:payload;
    if(!Array.isArray(candidates)||!candidates.length||!candidates.every(item=>typeof item?.label==='string'&&typeof item.score==='number'&&Number.isFinite(item.score)&&item.score>=0&&item.score<=1))throw new ProviderError('Text provider returned no usable classification.',502,'INVALID_PROVIDER_RESPONSE');
    const scores=candidates as Classification[];
    const fake=scores.find(item=>item.label.toLowerCase()==='fake');
    const real=scores.find(item=>item.label.toLowerCase()==='real');
    if(!fake&&!real)throw new ProviderError('Text provider returned unsupported classification labels.',502,'INVALID_PROVIDER_RESPONSE');
    const probability=fake?.score??(1-real!.score);
    const isAi=probability>0.5;
    const confidence=Math.round(Math.max(probability,1-probability)*100);
    return NextResponse.json({status:'completed',isReal:true,provider:'Hugging Face',
      result:isAi?'Likely AI-Generated':'Likely Human-Created',confidence,overallScore:confidence,
      aiProbabilityScore:Math.round(probability*100),sourceModel:null,
      signals:[{name:'Detector AI probability',score:probability,description:'Probability returned by the configured text classifier.'}],
      limitations:['This English-language model was trained on GPT-2 output and does not reliably identify modern generators.',
        'Results are estimates and cannot establish authorship. Short or edited text can be misclassified.',
        ...(text.length>2000?['Only the first 2,000 characters were analyzed.']:[]),
        'Use the separate Plagiarism detector to search for matching sources.'],
      disclaimer:'Model estimates can contain false positives and false negatives. No generator identity is inferred.',
      modelVersion:'openai-community/roberta-base-openai-detector',wordCount:text.trim().split(/\s+/).length,
    });
  }catch(error){return providerFailure(error,'Text detection is temporarily unavailable. No result was generated.');}
}
export const POST=withScanHistory('text',analyze);
