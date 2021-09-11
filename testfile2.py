def method_accumulate(method, n):
  def helper(method, n, tot):
    if n <= 0:
      return tot
    else:
      tot += method(n, tot)
      return helper(method, n - 1, tot)
   return helper(method, n - 1, n)

def method_product(x, y):
  return x * y

# method_accumulate(method_product, 5)
# 5 * 4 * 3 * 2 * 1 = 120
