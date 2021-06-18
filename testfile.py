def accumulate_sum(n):
  def helper(n, tot):
    if n <= 0:
      return tot
    tot = 0
    tot += n
    return helper(n - 1, tot)
    
  return helper(n, 0)
