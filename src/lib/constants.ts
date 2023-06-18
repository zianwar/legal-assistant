import { env } from '$env/dynamic/private';
import appRootPath from 'app-root-path';
import path from 'path';

export const VECTOR_STORE_DIR = env.DATA_DIR
	? path.join(env.DATA_DIR, 'vector')
	: path.join(appRootPath.path, 'data', 'vector');

export const DOCUMENTS_DIR = env.DATA_DIR
	? path.join(env.DATA_DIR, 'documents')
	: path.join(appRootPath.path, 'data', 'documents');

export const GENERIC_ERROR = 'Oups, an error happened, try again later.';
