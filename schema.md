# AGS Data Contract (final field names — never rename without updating this file)

products:   name, price, category, stock, imageUrl, active, createdAt
categories: name, imageUrl, active, order
orders:     customerUID, customerName, phone, address, items[{productId,name,price,qty}],
            totalAmount, status, paymentMethod, createdAt
admins:     doc id = admin UID (no fields needed; client writes blocked in rules)
users:      name, phone, createdAt   (NEVER store role here)

order.status: placed -> confirmed -> out_for_delivery -> delivered | cancelled
paymentMethod: "COD"
