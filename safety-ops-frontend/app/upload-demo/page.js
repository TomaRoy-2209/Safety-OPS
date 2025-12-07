import EvidenceUpload from '../components/EvidenceUpload';

export default function DemoPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-10">
            <h1 className="text-3xl font-bold mb-2 text-black">SafeCity Ops</h1>
            <h2 className="text-xl text-gray-600 mb-8">Module 1 Feature Demo: Evidence Upload</h2>
            
            <div className="w-full max-w-md">
                {/* Attaching to Incident ID #1 */}
                <EvidenceUpload incidentId={1} />
            </div>
        </div>
    );
}