/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import * as fs from "fs";
import * as path from "path";
import { IBlobStorage } from "@paperbits/common/persistence";

export class FileSystemBlobStorage implements IBlobStorage {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    public async uploadBlob(blobPath: string, content: Uint8Array): Promise<void> {
        const fullpath = `${this.basePath}/${blobPath}`.replace("//", "/");

        try {
            await fs.promises.mkdir(path.dirname(fullpath), { recursive: true });
            await fs.promises.writeFile(fullpath, Buffer.from(content.buffer));
        }
        catch (error) {
            console.error(error);
        }
    }

    public downloadBlob(blobPath: string): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            const fullpath = `${this.basePath}/${blobPath}`.replace("//", "/");

            fs.readFile(fullpath, (error, buffer: Buffer) => {
                if (error) {
                    reject(error);
                    return;
                }

                const arrayBuffer = new ArrayBuffer(buffer.length);
                const unit8Array = new Uint8Array(arrayBuffer);

                for (let i = 0; i < buffer.length; ++i) {
                    unit8Array[i] = buffer[i];
                }

                resolve(unit8Array);
            });
        });
    }

    public async listBlobs(): Promise<string[]> {
        const files = this.listAllFilesInDirectory(this.basePath);
        if (files.length > 0) {
            return files.map(file => file.split(this.basePath).pop());
        }
        return [];
    }

    private listAllFilesInDirectory(dir: string): string[] {
        const results = [];

        fs.readdirSync(dir).forEach((file) => {
            file = dir + "/" + file;
            const stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                results.push(...this.listAllFilesInDirectory(file));
            } else {
                results.push(file);
            }

        });

        return results;
    }

    public getDownloadUrl(): Promise<string> {
        throw new Error("Not supported");
    }

    public async deleteBlob(): Promise<void> {
        return null;
    }
}