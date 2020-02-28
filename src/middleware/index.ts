import {
  handleCors,
  handleBodyRequestParsing,
  handleCompression
} from './common';
import { handleApiDocs } from './apiDocs';

export default [
  handleCors,
  handleBodyRequestParsing,
  handleCompression,
  handleApiDocs
];
