import { env } from '$env/dynamic/private';
import appRootPath from 'app-root-path';
import path from 'path';

export const VECTOR_STORE_DIR = path.join(env.DATA_DIR ?? appRootPath.path, 'vector');
export const DOCUMENTS_DIR = path.join(env.DATA_DIR ?? appRootPath.path, 'documents');

export const GENERIC_ERROR = 'Oups, an error happened, try again later.';
