import { ImageResponse } from "next/og";
export const alt = "Rafael Vales — Fullstack developer with a focus on frontend";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
 return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:72,background:"#fafaf9",color:"#212321",fontFamily:"sans-serif"}}>
   <div style={{display:"flex",justifyContent:"space-between",fontSize:24,color:"#626560"}}><span>Portfolio</span><span>Mar del Plata, Argentina</span></div>
   <div style={{display:"flex",fontSize:132,letterSpacing:-8}}>Rafael Vales<span style={{color:"#6b8876"}}>.</span></div>
   <div style={{display:"flex",fontSize:30}}>Fullstack developer · Frontend & product design</div>
 </div>,size);
}
