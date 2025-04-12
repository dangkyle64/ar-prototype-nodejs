import { runColmap } from "./colmapRunner.js";

export const runPipeline = async () => {
    try {
        // 1. Feature Extraction
        await runColmap([
            'feature_extractor',
            '--database_path', '/workspace/database.db',
            '--image_path', '/images'
        ]);
  
        // 2. Feature Matching
        await runColmap([
            'exhaustive_matcher',
            '--database_path', '/workspace/database.db'
        ]);
    
        // 3. Sparse Reconstruction
        await runColmap([
            'mapper',
            '--database_path', '/workspace/database.db',
            '--image_path', '/images',
            '--output_path', '/workspace/sparse'
        ]);
    
        // 4. Image Undistortion
        await runColmap([
            'image_undistorter',
            '--image_path', '/images',
            '--input_path', '/workspace/sparse/0',
            '--output_path', '/workspace/dense',
            '--output_type', 'COLMAP'
        ]);
    
        // 5. Depth Map Estimation
        await runColmap([
            'patch_match_stereo',
            '--workspace_path', '/workspace/dense',
            '--workspace_format', 'COLMAP',
            '--PatchMatchStereo.geom_consistency', 'true'
        ]);
    
        // 6. Fuse Depth Maps into a 3D Model (Optional)
        await runColmap([
            'stereo_fusion',
            '--workspace_path', '/workspace/dense',
            '--workspace_format', 'COLMAP',
            '--input_type', 'photometric',
            '--output_path', '/workspace/fused.ply'
        ]);
    
        console.log('🎉 COLMAP pipeline complete!');
  
    } catch (err) {
        console.error('Error running COLMAP pipeline:', err);
    }
};
  