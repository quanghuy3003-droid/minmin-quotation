# Template Bao Gia Minmin

App bao gia Minmin dang chay dang static site, chi can file `index.html`.

Tinh nang chinh:

- Tao bao gia theo template Minmin.
- Tu tao ma hang theo loai den, kieu hang va ngay bao gia.
- Nhap so luong, don gia va tu tinh thanh tien.
- Chen anh san pham, logo va QR ngan hang.
- Xuat Excel bang SheetJS/ExcelJS, font Calibri, kho giay A4 landscape.
- Co tab tinh gia ban tu Nhan dan te.

## Chay app

```bash
node server.mjs
```

Mo `http://localhost:5173`.

## Luu anh va hoa don PDF tren Google Drive

App upload anh san pham va hoa don PDF len Google Drive, sau do chi luu link trong kho/Supabase.
File `google-drive-upload.gs` se tu tao folder Drive khi upload lan dau, khong can tao folder thu cong.

Folder goc:

- `MINMIN App Storage`

Mot so folder con app tu tao:

- `Anh san pham/<ma hang>`
- `Hoa don/Dau vao/<ma hang>`
- `Hoa don/Dau ra/<ma hang>`
- `Ke toan/Hoa don dau vao`

1. Mo file `google-drive-upload.gs`, copy noi dung vao Google Apps Script moi.
2. Trong Apps Script, chon Deploy > New deployment > Web app.
3. Chon:
   - Execute as: `Me`
   - Who has access: `Anyone`
4. Copy Web App URL.
5. Mo app > Kho hang > dan Web App URL > bam `Luu`.

Neu chua dan Web App URL, app se chan upload anh/PDF/hoa don de tranh luu file nang vao trinh duyet hoac Supabase.

## Dua len Vercel

Day la static site, nen Vercel khong can build.

Cach nhanh:

1. Tao project moi tren Vercel.
2. Upload/import thu muc co file `index.html`.
3. Framework Preset: `Other`.
4. Build Command: de trong.
5. Output Directory: de trong hoac `.`
6. Deploy.

Neu dung GitHub, dua cac file `index.html`, `vercel.json`, `README.md` len repository roi import repository do vao Vercel.

## Ket noi GitHub va Vercel

### Cach khuyen dung bang giao dien

1. Vao GitHub va tao repository moi, vi du `minmin-quotation`.
2. Upload cac file:
   - `index.html`
   - `vercel.json`
   - `README.md`
   - `.gitignore`
3. Vao Vercel, chon `Add New Project`.
4. Chon repository GitHub vua tao.
5. Cau hinh:
   - Framework Preset: `Other`
   - Build Command: de trong
   - Output Directory: de trong hoac `.`
6. Bam `Deploy`.

Sau nay moi lan sua app, chi can cap nhat file tren GitHub, Vercel se tu deploy lai.

### Neu dung terminal

May can cai Git/Command Line Tools truoc. Sau do chay:

```bash
git init
git add index.html vercel.json README.md .gitignore
git commit -m "Initial Minmin quotation app"
git branch -M main
git remote add origin https://github.com/USERNAME/minmin-quotation.git
git push -u origin main
```

## Cot trong Google Sheet danh muc san pham

Hang dau tien la tieu de cot. App doc duoc cac cot sau:

| ma_hang | tinh_trang | ten_san_pham | hinh_anh | kich_thuoc | dac_diem | don_vi | don_gia |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OD-01 | Dat hang 35-40 ngay | Den tha | | 160cm | Cho den thuy tinh | Cai (pcs) | 16100000 |

Ten cot co the dung tieng Viet khong dau hoac tieng Anh:

- Ma hang: `ma_hang`, `ma`, `masp`, `sku`, `id`, `code`
- Tinh trang: `tinh_trang`, `trang_thai`, `status`, `lead_time`
- Ten san pham: `ten_san_pham`, `san_pham`, `ten`, `name`, `product`
- Hinh anh: `hinh_anh`, `photo`, `image`, `anh`
- Kich thuoc: `kich_thuoc`, `dimension`, `size`
- Dac diem: `dac_diem`, `mo_ta`, `describe`, `description`
- Don vi: `don_vi`, `dvt`, `unit`
- Don gia: `don_gia`, `gia`, `price`, `unit_price`

Cot `hinh_anh` co the la link anh public. Neu link anh bi chan khi xuat Excel, hay chon file anh truc tiep trong app cho dong san pham do.

## Cong thuc Excel xuat ra

- Thanh tien tung dong: `SL * Don gia`
- Tong gia tri: `SUM(thanh tien cac san pham)`
- Chiet khau: `% chiet khau * Tong gia tri`
- Tong sau chiet khau: `Tong gia tri - Chiet khau`
- VAT: `% VAT * Tong sau chiet khau`
- Tong sau VAT: `Tong sau chiet khau + VAT`
- Dat coc: `% dat coc * Tong sau VAT`
- Con lai: `Tong sau VAT - Dat coc`
