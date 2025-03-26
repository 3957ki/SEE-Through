export default interface FaceDetectionResult {
  result: Array<{
    identity: string;
    hash?: string;
    target_x?: number;
    target_y?: number;
    target_w?: number;
    target_h?: number;
    source_x?: number;
    source_y?: number;
    source_w?: number;
    source_h?: number;
    threshold?: number;
    distance?: number;
  }>;
  is_new: boolean;
}
