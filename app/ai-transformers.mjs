/** Florence-only entry into the pinned Transformers.js source tree.
 *
 * The package root registers every supported model. This AI worker only runs
 * Florence-2, so register its exact architecture and load its implementation.
 */
import {env} from '../node_modules/@huggingface/transformers/src/env.js';
import {RawImage} from '../node_modules/@huggingface/transformers/src/utils/image.js';
import {Florence2Processor} from '../node_modules/@huggingface/transformers/src/models/florence2/processing_florence2.js';
import {Florence2ForConditionalGeneration} from '../node_modules/@huggingface/transformers/src/models/florence2/modeling_florence2.js';
import {MODEL_TYPES, MODEL_TYPE_MAPPING, MODEL_CLASS_TO_NAME_MAPPING,
  MODEL_NAME_TO_CLASS_MAPPING, registerTaskMappings} from '../node_modules/@huggingface/transformers/src/models/modeling_utils.js';

const architecture = 'Florence2ForConditionalGeneration';
MODEL_TYPE_MAPPING.set(architecture, MODEL_TYPES.ImageTextToText);
MODEL_CLASS_TO_NAME_MAPPING.set(Florence2ForConditionalGeneration, architecture);
MODEL_NAME_TO_CLASS_MAPPING.set(architecture, Florence2ForConditionalGeneration);
registerTaskMappings({
  MODEL_FOR_IMAGE_TEXT_TO_TEXT_MAPPING_NAMES:new Map([['florence2',architecture]]),
  MODEL_FOR_CAUSAL_LM_MAPPING_NAMES:new Map(),
  MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES:new Map(),
  MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES:new Map(),
  MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES:new Map(),
});

export {env,RawImage,Florence2Processor,Florence2ForConditionalGeneration};
