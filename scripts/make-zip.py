import os
import sys
import zipfile

def make_zip(src_dir, zip_path):
    src_dir = os.path.abspath(src_dir)
    zip_path = os.path.abspath(zip_path)

    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"Creating clean ZIP archive from: {src_dir}")
    print(f"Destination: {zip_path}")

    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for root, dirs, files in os.walk(src_dir):
            if 'node_modules' in dirs:
                dirs.remove('node_modules')
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, src_dir).replace('\\', '/')
                z.write(full_path, rel_path)

    stats = os.stat(zip_path)
    size_mb = stats.st_size / (1024 * 1024)
    print(f"SUCCESS: Created archive of size {size_mb:.2f} MB")

if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else '.next/standalone'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'a2-standalone-deploy.zip'
    make_zip(src, dst)

