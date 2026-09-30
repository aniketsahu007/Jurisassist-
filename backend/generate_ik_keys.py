import rsa

# Generate a 2048-bit RSA Key Pair
(public_key, private_key) = rsa.newkeys(2048)

# Save Private Key (Keep this secret and on the server!)
with open("ik_private.pem", "wb") as f:
    f.write(private_key.save_pkcs1("PEM"))

# Save Public Key (Upload this one to IndianKanoon)
with open("ik_public.pem", "wb") as f:
    f.write(public_key.save_pkcs1("PEM"))

print("✅ Successfully generated ik_private.pem and ik_public.pem")
print("⚠️ Please upload 'ik_public.pem' to the IndianKanoon portal.")
